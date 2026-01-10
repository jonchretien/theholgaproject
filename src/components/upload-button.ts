/**
 * UploadButton component for file selection via button click
 */

import type PubSub from "@/state/pubsub";
import type { StateStore, StateChangeEvent } from "@/state/store";
import { STATE_CHANGED } from "@/state/store";
import {
  FILE_INPUT_SELECTED,
  IMAGE_UPLOAD_FAILURE,
} from "@/state/constants";
import { validateImageFile } from "@/utils/validation";
import { FileUploadError, logError } from "@/types/errors";

/**
 * UploadButton component interface
 */
export interface UploadButtonComponent {
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
 * Creates an UploadButton component
 *
 * @param pubsub - PubSub instance for event communication
 * @param store - StateStore instance for state management
 * @returns UploadButton component instance
 */
export default function UploadButton(
  pubsub: PubSub,
  store: StateStore
): UploadButtonComponent {
  let buttonElement: HTMLButtonElement | null = null;
  let fileInputElement: HTMLInputElement | null = null;
  let eventController: AbortController | null = null;

  /**
   * Initializes the component
   */
  function init(): void {
    buttonElement = document.getElementById(
      "upload-trigger"
    ) as HTMLButtonElement;
    if (!buttonElement) return;

    createFileInput();
    pubsub.subscribe<StateChangeEvent>(STATE_CHANGED, handleStateChange);
    addEvents();

    // Set initial button state based on current state
    const currentState = store.getState();
    updateButtonState(currentState);
  }

  /**
   * Creates and attaches hidden file input element
   */
  function createFileInput(): void {
    fileInputElement = document.createElement("input");
    fileInputElement.type = "file";
    fileInputElement.accept =
      "image/jpeg,image/jpg,image/png,image/webp,image/gif";
    fileInputElement.setAttribute("aria-hidden", "true");
    fileInputElement.setAttribute("tabindex", "-1");
    fileInputElement.style.display = "none";
    buttonElement?.appendChild(fileInputElement);
  }

  /**
   * Adds event listeners using AbortController
   */
  function addEvents(): void {
    if (eventController) {
      eventController.abort();
    }

    eventController = new AbortController();
    const { signal } = eventController;

    buttonElement?.addEventListener("click", handleButtonClick, { signal });
    fileInputElement?.addEventListener("change", handleFileSelection, {
      signal,
    });
  }

  /**
   * Handles button click by triggering file input
   */
  function handleButtonClick(): void {
    fileInputElement?.click();
  }

  /**
   * Handles file selection from input
   */
  function handleFileSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const validationResult = validateImageFile(file);

    if (validationResult.valid) {
      pubsub.publish<FileUploadEvent>(FILE_INPUT_SELECTED, { file });
    } else {
      pubsub.publish(IMAGE_UPLOAD_FAILURE, {});
      logError(
        FileUploadError.validation(validationResult.error!),
        "UploadButton"
      );
    }

    // Reset input to allow selecting the same file again
    input.value = "";
  }

  /**
   * Updates button enabled/disabled state based on app state
   */
  function updateButtonState(currentState: string): void {
    if (!buttonElement) return;

    const shouldEnable = currentState === "idle" || currentState === "cleared";

    if (shouldEnable) {
      buttonElement.removeAttribute("disabled");
    } else {
      buttonElement.setAttribute("disabled", "true");
    }
  }

  /**
   * Handles state changes to enable/disable button
   */
  function handleStateChange(event: StateChangeEvent): void {
    updateButtonState(event.currentState);
  }

  /**
   * Cleans up event listeners and subscriptions
   */
  function cleanup(): void {
    if (eventController) {
      eventController.abort();
      eventController = null;
    }

    pubsub.unsubscribe<StateChangeEvent>(STATE_CHANGED, handleStateChange);

    if (fileInputElement && buttonElement) {
      buttonElement.removeChild(fileInputElement);
    }

    fileInputElement = null;
    buttonElement = null;
  }

  return {
    init,
    cleanup,
  };
}
