/**
 * CropOverlay component for drag-to-pan crop positioning
 */

import { $ } from "@/utils/dom";
import { CANVAS_SIZE } from "@/config";
import {
  CONFIRM_CROP,
  IMAGE_UPLOAD_SUCCESS,
} from "@/state/constants";
import { STATE_CHANGED, type StateChangeEvent } from "@/state/store";
import { computeCoverCrop, applyOffset, type CropRect } from "@/utils/crop";
import type PubSub from "@/state/pubsub";

const ARROW_KEY_STEP = 20;
const NEAR_SQUARE_THRESHOLD = 4;

export interface CropOverlayComponent {
  init: () => void;
  cleanup: () => void;
}

interface ImageUploadEvent {
  image: HTMLImageElement;
}

export default function CropOverlay(
  pubsub: PubSub
): CropOverlayComponent {
  let canvasElement: HTMLCanvasElement | null = null;
  let contextObject: CanvasRenderingContext2D | null = null;
  let confirmButton: HTMLButtonElement | null = null;
  let currentImage: HTMLImageElement | null = null;
  let currentCrop: CropRect | null = null;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let cropAtDragStart: CropRect | null = null;
  let scaleRatio = 1;
  let eventController: AbortController | null = null;

  function init(): void {
    confirmButton = $<HTMLButtonElement>("#confirm-crop");

    pubsub.subscribe<ImageUploadEvent>(IMAGE_UPLOAD_SUCCESS, handleImageReady);
    pubsub.subscribe<StateChangeEvent>(STATE_CHANGED, handleStateChange);
  }

  function handleStateChange(event: StateChangeEvent): void {
    if (event.currentState !== "cropping") {
      disableCropping();
    }
  }

  function handleImageReady(event: ImageUploadEvent): void {
    currentImage = event.image;
    canvasElement = $<HTMLCanvasElement>("canvas");
    if (!canvasElement) return;

    contextObject = canvasElement.getContext("2d");
    if (!contextObject) return;

    const imgW = currentImage.naturalWidth;
    const imgH = currentImage.naturalHeight;

    currentCrop = computeCoverCrop(imgW, imgH);
    scaleRatio = currentCrop.sw / CANVAS_SIZE;

    // Check if image is square/near-square — skip crop step
    if (Math.abs(imgW - imgH) <= NEAR_SQUARE_THRESHOLD) {
      drawCrop();
      autoConfirm();
      return;
    }

    drawCrop();
    enableCropping();
  }

  function autoConfirm(): void {
    pubsub.publish(CONFIRM_CROP, { crop: currentCrop });
  }

  function enableCropping(): void {
    if (!canvasElement || !confirmButton) return;

    if (eventController) {
      eventController.abort();
    }
    eventController = new AbortController();
    const { signal } = eventController;

    canvasElement.style.touchAction = "none";
    canvasElement.style.cursor = "grab";
    canvasElement.setAttribute("tabindex", "0");

    canvasElement.addEventListener("pointerdown", onPointerDown, { signal });
    canvasElement.addEventListener("pointermove", onPointerMove, { signal });
    canvasElement.addEventListener("pointerup", onPointerUp, { signal });
    canvasElement.addEventListener("pointercancel", onPointerUp, { signal });
    canvasElement.addEventListener("keydown", onKeyDown, { signal });

    confirmButton.disabled = false;
    confirmButton.style.display = "";
    confirmButton.addEventListener("click", onConfirmClick, { signal });
  }

  function disableCropping(): void {
    if (eventController) {
      eventController.abort();
      eventController = null;
    }

    if (canvasElement) {
      canvasElement.style.touchAction = "";
      canvasElement.style.cursor = "";
      canvasElement.removeAttribute("tabindex");
    }

    if (confirmButton) {
      confirmButton.disabled = true;
      confirmButton.style.display = "none";
    }
  }

  function onPointerDown(event: PointerEvent): void {
    if (!canvasElement) return;
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    cropAtDragStart = currentCrop ? { ...currentCrop } : null;
    canvasElement.style.cursor = "grabbing";
    canvasElement.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent): void {
    if (!isDragging || !cropAtDragStart || !currentImage) return;

    const deltaX = -(event.clientX - dragStartX) * scaleRatio;
    const deltaY = -(event.clientY - dragStartY) * scaleRatio;

    currentCrop = applyOffset(
      cropAtDragStart,
      deltaX,
      deltaY,
      currentImage.naturalWidth,
      currentImage.naturalHeight
    );

    drawCrop();
  }

  function onPointerUp(): void {
    if (!canvasElement) return;
    isDragging = false;
    cropAtDragStart = null;
    canvasElement.style.cursor = "grab";
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (!currentCrop || !currentImage) return;

    let deltaX = 0;
    let deltaY = 0;

    switch (event.key) {
      case "ArrowLeft":
        deltaX = -ARROW_KEY_STEP * scaleRatio;
        break;
      case "ArrowRight":
        deltaX = ARROW_KEY_STEP * scaleRatio;
        break;
      case "ArrowUp":
        deltaY = -ARROW_KEY_STEP * scaleRatio;
        break;
      case "ArrowDown":
        deltaY = ARROW_KEY_STEP * scaleRatio;
        break;
      default:
        return;
    }

    event.preventDefault();
    currentCrop = applyOffset(
      currentCrop,
      deltaX,
      deltaY,
      currentImage.naturalWidth,
      currentImage.naturalHeight
    );
    drawCrop();
  }

  function onConfirmClick(): void {
    pubsub.publish(CONFIRM_CROP, { crop: currentCrop });
  }

  function drawCrop(): void {
    if (!contextObject || !canvasElement || !currentImage || !currentCrop) return;

    contextObject.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    contextObject.drawImage(
      currentImage,
      currentCrop.sx,
      currentCrop.sy,
      currentCrop.sw,
      currentCrop.sh,
      0,
      0,
      CANVAS_SIZE,
      CANVAS_SIZE
    );
  }

  function cleanup(): void {
    disableCropping();
    pubsub.unsubscribe<ImageUploadEvent>(IMAGE_UPLOAD_SUCCESS, handleImageReady);
    pubsub.unsubscribe<StateChangeEvent>(STATE_CHANGED, handleStateChange);
    currentImage = null;
    currentCrop = null;
  }

  return { init, cleanup };
}
