/**
 * PhotoCanvas component for image upload and processing
 */

import { $ } from "@/utils/dom";
import { STATE_CHANGED, type StateChangeEvent, type StateStore } from "@/state/store";
import {
  ADD_BUTTON_EVENTS,
  APPLY_BW_FILTER,
  APPLY_COLOR_FILTER,
  CLEAR_CANVAS,
  IMAGE_UPLOAD,
  IMAGE_UPLOAD_SUCCESS,
  IMAGE_UPLOAD_FAILURE,
  REMOVE_BUTTON_EVENTS,
  SAVE_IMAGE,
} from "@/state/constants";
import FX from "@/lib/effects";
import type PubSub from "@/state/pubsub";
import type { HeadingComponent } from "./heading";
import { validateImageFile } from "@/utils/validation";
import {
  CANVAS_SIZE,
  CANVAS_CLASSES,
  UI_CLASSES,
  DOWNLOAD_CONFIG,
} from "@/config";
import { FileUploadError, CanvasError, logError } from "@/types/errors";

/**
 * PhotoCanvas component interface
 */
export interface PhotoCanvasComponent {
  init: () => void;
  cleanup: () => void;
}

/**
 * Creates a PhotoCanvas component
 *
 * @param pubsub - PubSub instance for event communication
 * @param heading - Heading component for displaying messages
 * @param store - StateStore instance for state management
 * @returns PhotoCanvas component instance
 */
export default function PhotoCanvas(
  pubsub: PubSub,
  heading: HeadingComponent,
  store: StateStore
): PhotoCanvasComponent {
  const canvasContainerElement = $<HTMLElement>("#canvas-container");
  const containerElement = $<HTMLElement>("#container");

  let canvasElement: HTMLCanvasElement | null = null;
  let contextObject: CanvasRenderingContext2D | null = null;

  /**
   * Initializes canvas elements and subscriptions
   */
  function init(): void {
    createCanvasElement();
    addEvents();

    // Subscribe to effect actions
    pubsub.subscribe(APPLY_BW_FILTER, applyBlackWhiteFX);
    pubsub.subscribe(APPLY_COLOR_FILTER, applyColorFX);
    pubsub.subscribe(CLEAR_CANVAS, clearCanvas);
    pubsub.subscribe(SAVE_IMAGE, saveImage);

    // Subscribe to state changes (no more local state!)
    pubsub.subscribe<StateChangeEvent>(STATE_CHANGED, handleStateChange);
  }

  /**
   * Handles state changes from the StateStore
   * This replaces the local currentState variable
   */
  function handleStateChange(event: StateChangeEvent): void {
    const { currentState } = event;

    // Handle state-specific logic
    if (currentState === "error") {
      removeErrorMessage();
    }
  }

  /**
   * Creates the canvas element
   */
  function createCanvasElement(): void {
    if (!canvasContainerElement) {
      throw new CanvasError("Canvas container element not found");
    }

    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", CANVAS_SIZE.toString());
    canvas.setAttribute("height", CANVAS_SIZE.toString());
    canvasContainerElement.appendChild(canvas);

    canvasElement = $<HTMLCanvasElement>("canvas");
    if (!canvasElement) {
      throw new CanvasError("Failed to create canvas element");
    }

    const ctx = canvasElement.getContext("2d");
    if (!ctx) {
      throw CanvasError.contextCreation();
    }

    contextObject = ctx;
  }

  /**
   * Adds event listeners for drag and drop
   */
  function addEvents(): void {
    if (!canvasElement) return;

    canvasElement.addEventListener("dragover", addHoverClass);
    canvasElement.addEventListener("dragend", removeHoverClass);
    document.documentElement.addEventListener("drop", dropElement, true);
  }

  /**
   * Removes event listeners (cleanup)
   */
  function removeEvents(): void {
    if (!canvasElement) return;

    canvasElement.removeEventListener("dragover", addHoverClass);
    canvasElement.removeEventListener("dragend", removeHoverClass);
    document.documentElement.removeEventListener("drop", dropElement, true);
  }

  /**
   * Adds hover class on dragover
   */
  function addHoverClass(event: DragEvent): void {
    event.preventDefault();
    (event.target as HTMLElement).classList.add(CANVAS_CLASSES.hover);
  }

  /**
   * Removes hover class on dragend
   */
  function removeHoverClass(event: DragEvent): void {
    event.preventDefault();
    (event.target as HTMLElement).classList.remove(CANVAS_CLASSES.hover);
  }

  /**
   * Handles file drop event with validation
   */
  function dropElement(event: DragEvent): void {
    event.preventDefault();

    if (!canvasElement || !contextObject) return;

    const currentState = store.getState();
    canvasElement.classList.remove(CANVAS_CLASSES.hover);

    // Get the dropped file
    const file = event.dataTransfer?.files[0];

    // Validate the file
    const validationResult = validateImageFile(file);
    if (!validationResult.valid) {
      heading.update("error");
      store.setState(currentState, IMAGE_UPLOAD_FAILURE);
      logError(
        FileUploadError.validation(validationResult.error!),
        "PhotoCanvas"
      );
      return;
    }

    // File is valid, proceed with upload
    store.setState(currentState, IMAGE_UPLOAD);
    removeErrorMessage();

    const reader = new FileReader();

    reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
      if (!contextObject || !canvasElement) return;

      const result = readerEvent.target?.result;
      if (typeof result !== "string") return;

      const imageObject = new Image();

      // Clear canvas before loading new image
      contextObject.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      imageObject.onload = () => {
        if (!contextObject) return;
        contextObject.drawImage(imageObject, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Update state and enable buttons
        const uploadState = store.getState();
        store.setState(uploadState, IMAGE_UPLOAD_SUCCESS);
        pubsub.publish(ADD_BUTTON_EVENTS);
      };

      imageObject.onerror = () => {
        handleImageLoadError();
      };

      imageObject.src = result;
    };

    reader.onerror = () => {
      handleFileReadError(file!);
    };

    reader.readAsDataURL(file!);
  }

  /**
   * Handles file reading errors
   */
  function handleFileReadError(file: File): void {
    const currentState = store.getState();
    heading.update("error");
    store.setState(currentState, IMAGE_UPLOAD_FAILURE);
    logError(FileUploadError.reading(file), "PhotoCanvas");
  }

  /**
   * Handles image loading errors
   */
  function handleImageLoadError(): void {
    const currentState = store.getState();
    heading.update("error");
    store.setState(currentState, IMAGE_UPLOAD_FAILURE);
    logError(CanvasError.imageLoading(), "PhotoCanvas");
  }

  /**
   * Removes error message from DOM if it exists
   */
  function removeErrorMessage(): void {
    if (!containerElement) return;

    const errorElement = containerElement.querySelector(`.${UI_CLASSES.error}`);
    if (errorElement) {
      containerElement.removeChild(errorElement);
    }
  }

  /**
   * Applies black and white photo effects
   */
  function applyBlackWhiteFX(): void {
    if (!canvasElement || !contextObject) return;

    try {
      FX.applyGrayscaleFilter(canvasElement, contextObject);
      FX.applyBlur(canvasElement, contextObject);
      FX.applyVignette(canvasElement, contextObject);
    } catch (error) {
      logError(error, "PhotoCanvas:applyBlackWhiteFX");
    }
  }

  /**
   * Applies color photo effects
   */
  function applyColorFX(): void {
    if (!canvasElement || !contextObject) return;

    try {
      FX.applyColorFilter(canvasElement, contextObject);
      FX.applyBlur(canvasElement, contextObject);
      FX.applyVignette(canvasElement, contextObject);
    } catch (error) {
      logError(error, "PhotoCanvas:applyColorFX");
    }
  }

  /**
   * Saves the canvas image as a PNG file
   */
  function saveImage(): void {
    if (!canvasElement) return;

    try {
      const imageData = canvasElement.toDataURL(DOWNLOAD_CONFIG.mimeType);
      const link = document.createElement("a");
      link.href = imageData;
      link.download = DOWNLOAD_CONFIG.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      logError(error, "PhotoCanvas:saveImage");
    }
  }

  /**
   * Clears the canvas
   */
  function clearCanvas(): void {
    if (!canvasElement || !contextObject) return;

    contextObject.clearRect(0, 0, canvasElement.width, canvasElement.height);
    pubsub.publish(REMOVE_BUTTON_EVENTS);
  }

  /**
   * Cleanup function to remove event listeners and subscriptions
   */
  function cleanup(): void {
    // Remove DOM event listeners
    removeEvents();

    // Unsubscribe from PubSub
    pubsub.unsubscribe(APPLY_BW_FILTER, applyBlackWhiteFX);
    pubsub.unsubscribe(APPLY_COLOR_FILTER, applyColorFX);
    pubsub.unsubscribe(CLEAR_CANVAS, clearCanvas);
    pubsub.unsubscribe(SAVE_IMAGE, saveImage);
    pubsub.unsubscribe<StateChangeEvent>(STATE_CHANGED, handleStateChange);
  }

  return {
    init,
    cleanup,
  };
}
