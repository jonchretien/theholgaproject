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
  FILE_INPUT_SELECTED,
  IMAGE_UPLOAD,
  IMAGE_UPLOAD_SUCCESS,
  IMAGE_UPLOAD_FAILURE,
  REMOVE_BUTTON_EVENTS,
  REMOVE_FILTER,
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
 * File upload event payload
 */
interface FileUploadEvent {
  file: File;
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
  let eventController: AbortController | null = null;
  let activeFilterButton: HTMLButtonElement | null = null;
  let originalImageData: ImageData | null = null;

  /**
   * Initializes canvas elements and subscriptions
   */
  function init(): void {
    createCanvasElement();
    addEvents();

    // Subscribe to file input selection
    pubsub.subscribe<FileUploadEvent>(FILE_INPUT_SELECTED, handleFileInput);

    // Subscribe to effect actions
    pubsub.subscribe(APPLY_BW_FILTER, applyBlackWhiteFX);
    pubsub.subscribe(APPLY_COLOR_FILTER, applyColorFX);
    pubsub.subscribe(REMOVE_FILTER, removeFilter);
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
   * Adds event listeners for drag and drop using AbortController
   * Can be called multiple times - automatically cleans up previous listeners
   */
  function addEvents(): void {
    if (!canvasElement) return;

    // Abort existing listeners if called multiple times
    if (eventController) {
      eventController.abort();
    }

    // Create new controller
    eventController = new AbortController();
    const { signal } = eventController;

    // Add listeners with signal
    canvasElement.addEventListener("dragenter", addHoverClass, { signal });
    canvasElement.addEventListener("dragover", addHoverClass, { signal });
    canvasElement.addEventListener("dragleave", removeHoverClass, { signal });
    canvasElement.addEventListener("dragend", removeHoverClass, { signal });
    document.documentElement.addEventListener("drop", dropElement, {
      capture: true,
      signal,
    });
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
   * Processes an image file (from drag-drop or file input)
   */
  function processImageFile(file: File | undefined): void {
    if (!canvasElement || !contextObject) return;

    // Remove hover class if present
    canvasElement.classList.remove(CANVAS_CLASSES.hover);

    // Validate the file
    const validationResult = validateImageFile(file);
    if (!validationResult.valid) {
      heading.update("error");
      store.setState(store.getState(), IMAGE_UPLOAD_FAILURE);
      logError(
        FileUploadError.validation(validationResult.error!),
        "PhotoCanvas"
      );
      return;
    }

    // File is valid, proceed with upload
    store.setState(store.getState(), IMAGE_UPLOAD);
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
        if (!contextObject || !canvasElement) return;
        contextObject.drawImage(imageObject, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Store the original image data for filter switching
        originalImageData = contextObject.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Update state and enable buttons
        store.setState(store.getState(), IMAGE_UPLOAD_SUCCESS);
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
   * Handles file drop event with validation
   */
  function dropElement(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    processImageFile(file);
  }

  /**
   * Handles file input selection
   */
  function handleFileInput(event: FileUploadEvent): void {
    processImageFile(event.file);
  }

  /**
   * Handles file reading errors
   */
  function handleFileReadError(file: File): void {
    heading.update("error");
    store.setState(store.getState(), IMAGE_UPLOAD_FAILURE);
    logError(FileUploadError.reading(file), "PhotoCanvas");
  }

  /**
   * Handles image loading errors
   */
  function handleImageLoadError(): void {
    heading.update("error");
    store.setState(store.getState(), IMAGE_UPLOAD_FAILURE);
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
   * Updates the active filter button visual state
   * @param filterType - The filter button to mark as active
   */
  function updateActiveFilterButton(filterType: 'bw' | 'color' | 'remove'): void {
    // Remove active class from all filter buttons
    const buttons = document.querySelectorAll<HTMLButtonElement>(
      'button[data-action="APPLY_BW_FILTER"], button[data-action="APPLY_COLOR_FILTER"], button[data-action="REMOVE_FILTER"]'
    );
    buttons.forEach((btn) => btn.classList.remove('btn--active'));

    // Add active class to current filter button
    let selector: string;
    if (filterType === 'bw') {
      selector = 'button[data-action="APPLY_BW_FILTER"]';
    } else if (filterType === 'color') {
      selector = 'button[data-action="APPLY_COLOR_FILTER"]';
    } else {
      selector = 'button[data-action="REMOVE_FILTER"]';
    }

    const activeButton = document.querySelector<HTMLButtonElement>(selector);
    if (activeButton) {
      activeButton.classList.add('btn--active');
      activeFilterButton = activeButton;
    }
  }

  /**
   * Applies black and white photo effects
   */
  function applyBlackWhiteFX(): void {
    if (!canvasElement || !contextObject || !originalImageData) return;

    try {
      // Restore original image before applying new filter
      contextObject.putImageData(originalImageData, 0, 0);

      FX.applyGrayscaleFilter(canvasElement, contextObject);
      FX.applyBlur(canvasElement, contextObject);
      FX.applyVignette(canvasElement, contextObject);

      // Update state machine: photo → filtered
      store.setState(store.getState(), APPLY_BW_FILTER);

      // Update UI feedback
      updateActiveFilterButton('bw');
      heading.update('bwFilterApplied');
    } catch (error) {
      logError(error, "PhotoCanvas:applyBlackWhiteFX");
    }
  }

  /**
   * Applies color photo effects
   */
  function applyColorFX(): void {
    if (!canvasElement || !contextObject || !originalImageData) return;

    try {
      // Restore original image before applying new filter
      contextObject.putImageData(originalImageData, 0, 0);

      FX.applyColorFilter(canvasElement, contextObject);
      FX.applyBlur(canvasElement, contextObject);
      FX.applyVignette(canvasElement, contextObject);

      // Update state machine: photo → filtered
      store.setState(store.getState(), APPLY_COLOR_FILTER);

      // Update UI feedback
      updateActiveFilterButton('color');
      heading.update('colorFilterApplied');
    } catch (error) {
      logError(error, "PhotoCanvas:applyColorFX");
    }
  }

  /**
   * Removes all filters and restores the original image
   */
  function removeFilter(): void {
    if (!canvasElement || !contextObject || !originalImageData) return;

    try {
      // Restore original image WITHOUT applying any effects
      contextObject.putImageData(originalImageData, 0, 0);

      // Update state machine: filtered/photo → photo
      store.setState(store.getState(), REMOVE_FILTER);

      // Update UI feedback
      updateActiveFilterButton('remove');
      heading.update('removeFilterApplied');
    } catch (error) {
      logError(error, "PhotoCanvas:removeFilter");
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

      // Update state machine: filtered/saved → saved
      store.setState(store.getState(), SAVE_IMAGE);
    } catch (error) {
      logError(error, "PhotoCanvas:saveImage");
    }
  }

  /**
   * Clears the canvas
   */
  function clearCanvas(): void {
    if (!canvasElement || !contextObject) {
      return;
    }

    const currentState = store.getState();

    contextObject.clearRect(0, 0, canvasElement.width, canvasElement.height);
    pubsub.publish(REMOVE_BUTTON_EVENTS);

    // Clear original image data
    originalImageData = null;

    // Remove active button styling
    if (activeFilterButton) {
      activeFilterButton.classList.remove('btn--active');
      activeFilterButton = null;
    }

    // Reset heading to instructions
    heading.update('instructions');

    // Update state machine: filtered/saved → cleared
    store.setState(currentState, CLEAR_CANVAS);
  }

  /**
   * Cleanup function to remove event listeners and subscriptions
   * Uses AbortController to efficiently remove all DOM event listeners
   */
  function cleanup(): void {
    // Abort all event listeners
    if (eventController) {
      eventController.abort();
      eventController = null;
    }

    // Unsubscribe from PubSub
    pubsub.unsubscribe<FileUploadEvent>(FILE_INPUT_SELECTED, handleFileInput);
    pubsub.unsubscribe(APPLY_BW_FILTER, applyBlackWhiteFX);
    pubsub.unsubscribe(APPLY_COLOR_FILTER, applyColorFX);
    pubsub.unsubscribe(REMOVE_FILTER, removeFilter);
    pubsub.unsubscribe(CLEAR_CANVAS, clearCanvas);
    pubsub.unsubscribe(SAVE_IMAGE, saveImage);
    pubsub.unsubscribe<StateChangeEvent>(STATE_CHANGED, handleStateChange);
  }

  return {
    init,
    cleanup,
  };
}
