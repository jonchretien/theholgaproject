/**
 * UploadButton component tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import UploadButton from "./upload-button";
import type PubSub from "@/state/pubsub";
import type { StateStore } from "@/state/store";
import { STATE_CHANGED } from "@/state/store";
import {
  FILE_INPUT_SELECTED,
  IMAGE_UPLOAD_FAILURE,
} from "@/state/constants";

describe("UploadButton", () => {
  let mockPubSub: PubSub;
  let mockStore: StateStore;
  let subscriptions: Map<string, Function>;

  beforeEach(() => {
    // Create DOM structure with upload button
    document.body.innerHTML = `
      <button id="upload-trigger">Choose Photo</button>
    `;

    // Track subscriptions
    subscriptions = new Map();

    // Create mock PubSub
    mockPubSub = {
      subscribe: vi.fn((topic: string, callback: Function) => {
        subscriptions.set(topic, callback);
      }),
      unsubscribe: vi.fn(),
      publish: vi.fn(),
    } as unknown as PubSub;

    // Create mock StateStore
    mockStore = {
      getState: vi.fn(() => "idle"),
      setState: vi.fn(),
    } as unknown as StateStore;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    subscriptions.clear();
  });

  it("should initialize without errors", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    expect(() => uploadButton.init()).not.toThrow();
  });

  it("should create and attach hidden file input element", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger");
    const fileInput = button?.querySelector('input[type="file"]');

    expect(fileInput).toBeDefined();
    expect(fileInput?.getAttribute("type")).toBe("file");
    expect(fileInput?.getAttribute("accept")).toContain("image/jpeg");
    expect(fileInput?.style.display).toBe("none");
  });

  it("should subscribe to STATE_CHANGED on init", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    expect(mockPubSub.subscribe).toHaveBeenCalledWith(
      STATE_CHANGED,
      expect.any(Function)
    );
  });

  it("should enable button on init when state is idle", () => {
    mockStore.getState = vi.fn(() => "idle");

    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger") as HTMLButtonElement;
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("should keep button disabled on init when state is photo", () => {
    mockStore.getState = vi.fn(() => "photo");

    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger") as HTMLButtonElement;
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("should trigger file input click when button is clicked", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger") as HTMLButtonElement;
    const fileInput = button.querySelector('input[type="file"]') as HTMLInputElement;

    // Mock the click method to avoid infinite loop in test environment
    const clickMock = vi.fn();
    fileInput.click = clickMock;

    button.click();

    expect(clickMock).toHaveBeenCalled();
  });

  it("should publish FILE_INPUT_SELECTED when valid file is selected", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger") as HTMLButtonElement;
    const fileInput = button.querySelector('input[type="file"]') as HTMLInputElement;

    // Create a mock file
    const mockFile = new File(["content"], "test.jpg", { type: "image/jpeg" });

    // Mock the files property
    Object.defineProperty(fileInput, "files", {
      value: [mockFile],
      writable: false,
    });

    // Trigger change event
    fileInput.dispatchEvent(new Event("change"));

    expect(mockPubSub.publish).toHaveBeenCalledWith(
      FILE_INPUT_SELECTED,
      { file: mockFile }
    );
  });

  it("should publish IMAGE_UPLOAD_FAILURE for invalid file", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger") as HTMLButtonElement;
    const fileInput = button.querySelector('input[type="file"]') as HTMLInputElement;

    // Create an invalid mock file (too large)
    const mockFile = new File(
      [new ArrayBuffer(11 * 1024 * 1024)], // 11MB
      "test.jpg",
      { type: "image/jpeg" }
    );

    Object.defineProperty(fileInput, "files", {
      value: [mockFile],
      writable: false,
    });

    fileInput.dispatchEvent(new Event("change"));

    expect(mockPubSub.publish).toHaveBeenCalledWith(IMAGE_UPLOAD_FAILURE, {});
  });

  it("should reset file input value after selection", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger") as HTMLButtonElement;
    const fileInput = button.querySelector('input[type="file"]') as HTMLInputElement;

    const mockFile = new File(["content"], "test.jpg", { type: "image/jpeg" });

    Object.defineProperty(fileInput, "files", {
      value: [mockFile],
      writable: false,
    });

    fileInput.dispatchEvent(new Event("change"));

    expect(fileInput.value).toBe("");
  });

  it("should enable button when state is idle", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger") as HTMLButtonElement;
    button.setAttribute("disabled", "true");

    const stateChangeCallback = subscriptions.get(STATE_CHANGED);
    stateChangeCallback?.({ currentState: "idle" });

    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("should enable button when state is cleared", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger") as HTMLButtonElement;
    button.setAttribute("disabled", "true");

    const stateChangeCallback = subscriptions.get(STATE_CHANGED);
    stateChangeCallback?.({ currentState: "cleared" });

    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("should disable button when state is photo", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger") as HTMLButtonElement;
    button.removeAttribute("disabled");

    const stateChangeCallback = subscriptions.get(STATE_CHANGED);
    stateChangeCallback?.({ currentState: "photo" });

    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("should disable button when state is upload", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger") as HTMLButtonElement;
    button.removeAttribute("disabled");

    const stateChangeCallback = subscriptions.get(STATE_CHANGED);
    stateChangeCallback?.({ currentState: "upload" });

    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("should cleanup event listeners on cleanup", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger") as HTMLButtonElement;
    const fileInput = button.querySelector('input[type="file"]') as HTMLInputElement;

    const clickSpy = vi.spyOn(fileInput, "click");

    uploadButton.cleanup();

    // Click after cleanup should not trigger file input
    button.click();
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("should unsubscribe from STATE_CHANGED on cleanup", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    uploadButton.cleanup();

    expect(mockPubSub.unsubscribe).toHaveBeenCalledWith(
      STATE_CHANGED,
      expect.any(Function)
    );
  });

  it("should remove file input element on cleanup", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger") as HTMLButtonElement;
    let fileInput = button.querySelector('input[type="file"]');
    expect(fileInput).toBeDefined();

    uploadButton.cleanup();

    fileInput = button.querySelector('input[type="file"]');
    expect(fileInput).toBeNull();
  });

  it("should handle multiple cleanup calls safely", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    expect(() => {
      uploadButton.cleanup();
      uploadButton.cleanup();
      uploadButton.cleanup();
    }).not.toThrow();
  });

  it("should not error if button element is not found", () => {
    document.body.innerHTML = ""; // Remove button

    const uploadButton = UploadButton(mockPubSub, mockStore);
    expect(() => uploadButton.init()).not.toThrow();
  });

  it("should not publish event if no file is selected", () => {
    const uploadButton = UploadButton(mockPubSub, mockStore);
    uploadButton.init();

    const button = document.getElementById("upload-trigger") as HTMLButtonElement;
    const fileInput = button.querySelector('input[type="file"]') as HTMLInputElement;

    // No files selected
    Object.defineProperty(fileInput, "files", {
      value: [],
      writable: false,
    });

    fileInput.dispatchEvent(new Event("change"));

    expect(mockPubSub.publish).not.toHaveBeenCalledWith(
      FILE_INPUT_SELECTED,
      expect.anything()
    );
  });
});
