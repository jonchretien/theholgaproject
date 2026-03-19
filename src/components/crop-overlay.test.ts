import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CropOverlay from "./crop-overlay";
import type PubSub from "@/state/pubsub";
import { IMAGE_UPLOAD_SUCCESS, CONFIRM_CROP } from "@/state/constants";
import { STATE_CHANGED } from "@/state/store";

describe("CropOverlay", () => {
  let mockPubSub: PubSub;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="canvas-container">
        <canvas width="820" height="820"></canvas>
      </div>
      <button id="confirm-crop" disabled style="display: none"></button>
    `;

    mockContext = {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext) as any;

    mockPubSub = {
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      publish: vi.fn(),
    } as unknown as PubSub;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should subscribe to IMAGE_UPLOAD_SUCCESS and STATE_CHANGED on init", () => {
    const overlay = CropOverlay(mockPubSub);
    overlay.init();

    const calls = (mockPubSub.subscribe as any).mock.calls;
    const topics = calls.map((c: any[]) => c[0]);

    expect(topics).toContain(IMAGE_UPLOAD_SUCCESS);
    expect(topics).toContain(STATE_CHANGED);
  });

  it("should unsubscribe on cleanup (idempotent)", () => {
    const overlay = CropOverlay(mockPubSub);
    overlay.init();
    overlay.cleanup();
    overlay.cleanup(); // safe to call twice

    // 2 events × 2 cleanup calls = 4 unsubscribe calls
    expect(mockPubSub.unsubscribe).toHaveBeenCalledTimes(4);
  });

  it("should publish CONFIRM_CROP on confirm button click when cropping", () => {
    const overlay = CropOverlay(mockPubSub);
    overlay.init();

    // Simulate IMAGE_UPLOAD_SUCCESS with a landscape image
    const imageReadyCallback = (mockPubSub.subscribe as any).mock.calls
      .find((c: any[]) => c[0] === IMAGE_UPLOAD_SUCCESS)?.[1];

    const mockImage = {
      naturalWidth: 1920,
      naturalHeight: 1080,
    } as HTMLImageElement;

    imageReadyCallback({ image: mockImage });

    // enableCropping is called by handleImageReady for non-square images
    // Click confirm button
    const confirmBtn = document.getElementById("confirm-crop") as HTMLButtonElement;
    confirmBtn.click();

    expect(mockPubSub.publish).toHaveBeenCalledWith(
      CONFIRM_CROP,
      expect.objectContaining({ crop: expect.any(Object) })
    );
  });

  it("should draw crop on canvas using 9-arg drawImage", () => {
    const overlay = CropOverlay(mockPubSub);
    overlay.init();

    const imageReadyCallback = (mockPubSub.subscribe as any).mock.calls
      .find((c: any[]) => c[0] === IMAGE_UPLOAD_SUCCESS)?.[1];

    const mockImage = {
      naturalWidth: 1920,
      naturalHeight: 1080,
    } as HTMLImageElement;

    imageReadyCallback({ image: mockImage });

    // drawImage should have been called with 9 args (source rect + dest rect)
    expect(mockContext.drawImage).toHaveBeenCalledWith(
      mockImage,
      expect.any(Number), // sx
      expect.any(Number), // sy
      expect.any(Number), // sw
      expect.any(Number), // sh
      0, 0, 820, 820
    );
  });

  it("should auto-confirm for square images", () => {
    const overlay = CropOverlay(mockPubSub);
    overlay.init();

    const imageReadyCallback = (mockPubSub.subscribe as any).mock.calls
      .find((c: any[]) => c[0] === IMAGE_UPLOAD_SUCCESS)?.[1];

    const mockImage = {
      naturalWidth: 800,
      naturalHeight: 800,
    } as HTMLImageElement;

    imageReadyCallback({ image: mockImage });

    expect(mockPubSub.publish).toHaveBeenCalledWith(
      CONFIRM_CROP,
      expect.objectContaining({ crop: expect.any(Object) })
    );
  });

  it("should set touch-action none on canvas during cropping", () => {
    const overlay = CropOverlay(mockPubSub);
    overlay.init();

    const imageReadyCallback = (mockPubSub.subscribe as any).mock.calls
      .find((c: any[]) => c[0] === IMAGE_UPLOAD_SUCCESS)?.[1];

    const mockImage = {
      naturalWidth: 1920,
      naturalHeight: 1080,
    } as HTMLImageElement;

    // enableCropping is called by handleImageReady for non-square images
    imageReadyCallback({ image: mockImage });

    const canvas = document.querySelector("canvas")!;
    expect(canvas.style.touchAction).toBe("none");
  });

  it("should disable confirm button immediately on click to prevent double-confirm", () => {
    const overlay = CropOverlay(mockPubSub);
    overlay.init();

    const imageReadyCallback = (mockPubSub.subscribe as any).mock.calls
      .find((c: any[]) => c[0] === IMAGE_UPLOAD_SUCCESS)?.[1];

    const mockImage = {
      naturalWidth: 1920,
      naturalHeight: 1080,
    } as HTMLImageElement;

    imageReadyCallback({ image: mockImage });

    const confirmBtn = document.getElementById("confirm-crop") as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(false);

    confirmBtn.click();

    expect(confirmBtn.disabled).toBe(true);
  });

  it("should update crop offset on arrow key press", () => {
    const overlay = CropOverlay(mockPubSub);
    overlay.init();

    const imageReadyCallback = (mockPubSub.subscribe as any).mock.calls
      .find((c: any[]) => c[0] === IMAGE_UPLOAD_SUCCESS)?.[1];

    const mockImage = {
      naturalWidth: 1920,
      naturalHeight: 1080,
    } as HTMLImageElement;

    // enableCropping is called by handleImageReady for non-square images
    imageReadyCallback({ image: mockImage });

    const canvas = document.querySelector("canvas")!;
    const initialDrawCount = (mockContext.drawImage as any).mock.calls.length;

    canvas.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    // Should have drawn again with updated crop
    expect((mockContext.drawImage as any).mock.calls.length).toBeGreaterThan(initialDrawCount);
  });
});
