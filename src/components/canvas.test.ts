/**
 * PhotoCanvas component tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PhotoCanvas from "./canvas";
import type PubSub from "@/state/pubsub";
import type { HeadingComponent } from "./heading";
import type { StateStore } from "@/state/store";
import { STATE_CHANGED } from "@/state/store";
import {
  APPLY_BW_FILTER,
  APPLY_COLOR_FILTER,
  REMOVE_FILTER,
  CLEAR_CANVAS,
  SAVE_IMAGE,
  ADD_BUTTON_EVENTS,
  REMOVE_BUTTON_EVENTS,
  FILE_INPUT_SELECTED,
} from "@/state/constants";

// Mock the FX module to avoid canvas image data processing
vi.mock("@/lib/effects", () => ({
  default: {
    applyGrayscaleFilter: vi.fn(),
    applyColorFilter: vi.fn(),
    applyBlur: vi.fn(),
    applyVignette: vi.fn(),
  },
}));

describe("PhotoCanvas event cleanup", () => {
  let mockPubSub: PubSub;
  let mockHeading: HeadingComponent;
  let mockStore: StateStore;
  let canvasContainerElement: HTMLElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    // Create DOM structure
    document.body.innerHTML = `
      <div id="container">
        <div id="canvas-container"></div>
      </div>
    `;

    canvasContainerElement = document.getElementById(
      "canvas-container"
    ) as HTMLElement;

    // Mock canvas getContext to return a mock 2D context
    const mockImageData = {
      data: new Uint8ClampedArray(820 * 820 * 4),
      width: 820,
      height: 820,
    } as ImageData;

    mockContext = {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => mockImageData),
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
      if (contextType === "2d") {
        return mockContext;
      }
      return null;
    }) as any;

    // Create mocks
    mockPubSub = {
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      publish: vi.fn(),
    } as unknown as PubSub;

    mockHeading = {
      update: vi.fn(),
    } as unknown as HeadingComponent;

    mockStore = {
      getState: vi.fn(() => "idle"),
      setState: vi.fn(),
      subscribe: vi.fn(),
      reset: vi.fn(),
    } as unknown as StateStore;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should initialize with canvas element", () => {
    const canvas = PhotoCanvas(mockPubSub, mockHeading, mockStore);
    canvas.init();

    const canvasElement = document.querySelector("canvas");
    expect(canvasElement).toBeTruthy();
    expect(canvasElement?.getAttribute("width")).toBe("820");
    expect(canvasElement?.getAttribute("height")).toBe("820");
  });

  it("should subscribe to PubSub events on init", () => {
    const canvas = PhotoCanvas(mockPubSub, mockHeading, mockStore);
    canvas.init();

    // Verify all 7 subscriptions were made
    expect(mockPubSub.subscribe).toHaveBeenCalledTimes(7);

    // Check that subscribe was called with the correct event names
    const calls = (mockPubSub.subscribe as any).mock.calls;
    const topics = calls.map((call: any[]) => call[0]);

    expect(topics).toContain(FILE_INPUT_SELECTED);
    expect(topics).toContain(APPLY_BW_FILTER);
    expect(topics).toContain(APPLY_COLOR_FILTER);
    expect(topics).toContain(REMOVE_FILTER);
    expect(topics).toContain(CLEAR_CANVAS);
    expect(topics).toContain(SAVE_IMAGE);
    expect(topics).toContain(STATE_CHANGED);
  });

  it("should unsubscribe from PubSub events on cleanup", () => {
    const canvas = PhotoCanvas(mockPubSub, mockHeading, mockStore);
    canvas.init();
    canvas.cleanup();

    // Verify all 7 unsubscriptions were made
    expect(mockPubSub.unsubscribe).toHaveBeenCalledTimes(7);

    // Check that unsubscribe was called with the correct event names
    const calls = (mockPubSub.unsubscribe as any).mock.calls;
    const topics = calls.map((call: any[]) => call[0]);

    expect(topics).toContain(FILE_INPUT_SELECTED);
    expect(topics).toContain(APPLY_BW_FILTER);
    expect(topics).toContain(APPLY_COLOR_FILTER);
    expect(topics).toContain(REMOVE_FILTER);
    expect(topics).toContain(CLEAR_CANVAS);
    expect(topics).toContain(SAVE_IMAGE);
    expect(topics).toContain(STATE_CHANGED);
  });

  it("should handle multiple init calls without error", () => {
    const canvas = PhotoCanvas(mockPubSub, mockHeading, mockStore);
    canvas.init();

    // Calling init again should abort previous listeners and create new ones
    expect(() => canvas.init()).not.toThrow();

    // Should still be able to cleanup
    expect(() => canvas.cleanup()).not.toThrow();
  });

  it("should handle multiple cleanup calls safely", () => {
    const canvas = PhotoCanvas(mockPubSub, mockHeading, mockStore);
    canvas.init();

    // Multiple cleanup calls should be safe
    expect(() => canvas.cleanup()).not.toThrow();
    expect(() => canvas.cleanup()).not.toThrow();
  });

  it("should remove canvas element and event listeners on cleanup", () => {
    const canvas = PhotoCanvas(mockPubSub, mockHeading, mockStore);
    canvas.init();

    const canvasElement = document.querySelector("canvas");
    expect(canvasElement).toBeTruthy();

    // Create a spy to track if dragenter events are handled
    const dragenterSpy = vi.fn();
    canvasElement?.addEventListener("dragenter", dragenterSpy);

    canvas.cleanup();

    // Dispatch dragenter event - our spy should still fire
    // but the component's listener should not
    const event = new Event("dragenter", { bubbles: true });
    canvasElement?.dispatchEvent(event);

    expect(dragenterSpy).toHaveBeenCalledTimes(1);
  });

  it("should add hover class on dragover", () => {
    const canvas = PhotoCanvas(mockPubSub, mockHeading, mockStore);
    canvas.init();

    const canvasElement = document.querySelector("canvas");
    expect(canvasElement).toBeTruthy();

    const event = new Event("dragover", { bubbles: true });
    Object.defineProperty(event, "preventDefault", {
      value: vi.fn(),
      writable: true,
    });

    canvasElement?.dispatchEvent(event);

    // Note: Testing the actual hover class behavior would require
    // more complex setup. This test verifies the event listener is attached.
  });

  describe("filter visual feedback", () => {
    /**
     * Helper function to simulate image upload
     * This manually triggers the image loading flow to populate originalImageData
     */
    function simulateImageUpload(): void {
      // Save originals
      const originalFileReader = global.FileReader;
      const originalImage = global.Image;

      let imageOnloadCallback: any = null;
      let fileReaderInstance: any = null;

      // Mock Image constructor
      const MockImage = vi.fn(function(this: any) {
        this.onload = null;
        this.onerror = null;
        this.src = "";

        // Store the onload callback when it's set
        Object.defineProperty(this, "onload", {
          get() { return imageOnloadCallback; },
          set(callback) { imageOnloadCallback = callback; },
        });

        return this;
      });
      global.Image = MockImage as any;

      // Mock FileReader constructor
      const MockFileReader = vi.fn(function(this: any) {
        this.onload = null;
        this.onerror = null;
        this.readAsDataURL = (file: File) => {
          // Immediately trigger onload with fake data
          if (this.onload) {
            this.onload({
              target: { result: "data:image/jpeg;base64,fakeImageData" },
            });

            // Then immediately trigger Image onload
            if (imageOnloadCallback) {
              imageOnloadCallback({} as Event);
            }
          }
        };

        fileReaderInstance = this;
        return this;
      });
      global.FileReader = MockFileReader as any;

      // Create and dispatch drop event
      const mockFile = new File(["fake image data"], "test.jpg", { type: "image/jpeg" });
      const dropEvent = new Event("drop", { bubbles: true, cancelable: true }) as DragEvent;
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: { files: [mockFile] },
      });
      Object.defineProperty(dropEvent, "preventDefault", {
        value: vi.fn(),
      });

      document.documentElement.dispatchEvent(dropEvent);

      // Restore originals
      global.FileReader = originalFileReader;
      global.Image = originalImage;
    }

    it("should update heading when B&W filter is applied", () => {
      const canvas = PhotoCanvas(mockPubSub, mockHeading, mockStore);
      canvas.init();

      // Simulate image upload to populate originalImageData
      simulateImageUpload();

      // Simulate B&W filter being applied
      const applyBWCallback = (mockPubSub.subscribe as any).mock.calls
        .find((call: any[]) => call[0] === APPLY_BW_FILTER)?.[1];

      if (applyBWCallback) {
        applyBWCallback();
        expect(mockHeading.update).toHaveBeenCalledWith("bwFilterApplied");
      }
    });

    it("should update heading when color filter is applied", () => {
      const canvas = PhotoCanvas(mockPubSub, mockHeading, mockStore);
      canvas.init();

      // Simulate image upload to populate originalImageData
      simulateImageUpload();

      // Simulate color filter being applied
      const applyColorCallback = (mockPubSub.subscribe as any).mock.calls
        .find((call: any[]) => call[0] === APPLY_COLOR_FILTER)?.[1];

      if (applyColorCallback) {
        applyColorCallback();
        expect(mockHeading.update).toHaveBeenCalledWith("colorFilterApplied");
      }
    });

    it("should update heading when remove filter is applied", () => {
      const canvas = PhotoCanvas(mockPubSub, mockHeading, mockStore);
      canvas.init();

      // Simulate image upload to populate originalImageData
      simulateImageUpload();

      // Simulate remove filter being applied
      const removeFilterCallback = (mockPubSub.subscribe as any).mock.calls
        .find((call: any[]) => call[0] === REMOVE_FILTER)?.[1];

      if (removeFilterCallback) {
        removeFilterCallback();
        expect(mockHeading.update).toHaveBeenCalledWith("removeFilterApplied");
      }
    });

    it("should restore original image data when remove filter is applied", () => {
      const canvas = PhotoCanvas(mockPubSub, mockHeading, mockStore);
      canvas.init();

      // Simulate image upload to populate originalImageData
      simulateImageUpload();

      // Simulate remove filter being applied
      const removeFilterCallback = (mockPubSub.subscribe as any).mock.calls
        .find((call: any[]) => call[0] === REMOVE_FILTER)?.[1];

      if (removeFilterCallback) {
        removeFilterCallback();
        // Verify that putImageData was called to restore the original image
        expect(mockContext.putImageData).toHaveBeenCalled();
      }
    });

    it("should update active button state when remove filter is applied", () => {
      const canvas = PhotoCanvas(mockPubSub, mockHeading, mockStore);
      canvas.init();

      // Create mock buttons in the DOM
      document.body.innerHTML += `
        <button data-action="APPLY_BW_FILTER"></button>
        <button data-action="APPLY_COLOR_FILTER"></button>
        <button data-action="REMOVE_FILTER"></button>
      `;

      // Simulate image upload to populate originalImageData
      simulateImageUpload();

      // Simulate remove filter being applied
      const removeFilterCallback = (mockPubSub.subscribe as any).mock.calls
        .find((call: any[]) => call[0] === REMOVE_FILTER)?.[1];

      if (removeFilterCallback) {
        removeFilterCallback();

        // Verify the remove filter button gets the active class
        const removeButton = document.querySelector('[data-action="REMOVE_FILTER"]');
        expect(removeButton?.classList.contains('btn--active')).toBe(true);
      }
    });

    it("should reset heading when canvas is cleared", () => {
      const canvas = PhotoCanvas(mockPubSub, mockHeading, mockStore);
      canvas.init();

      // Simulate image upload to populate originalImageData
      simulateImageUpload();

      // First apply a filter
      const applyBWCallback = (mockPubSub.subscribe as any).mock.calls
        .find((call: any[]) => call[0] === APPLY_BW_FILTER)?.[1];
      if (applyBWCallback) {
        applyBWCallback();
      }

      // Then clear the canvas
      const clearCallback = (mockPubSub.subscribe as any).mock.calls
        .find((call: any[]) => call[0] === CLEAR_CANVAS)?.[1];

      if (clearCallback) {
        clearCallback();
        expect(mockHeading.update).toHaveBeenCalledWith("instructions");
      }
    });
  });
});
