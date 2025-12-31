/**
 * Unit tests for image effects
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FX from './effects';

/**
 * Creates a mock Canvas element
 */
function createMockCanvas(width = 100, height = 100): HTMLCanvasElement {
  return {
    width,
    height,
    getContext: vi.fn(),
  } as unknown as HTMLCanvasElement;
}

/**
 * Creates mock ImageData with specified dimensions
 */
function createMockImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);

  // Fill with some default pixel data (white image)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;     // R
    data[i + 1] = 255; // G
    data[i + 2] = 255; // B
    data[i + 3] = 255; // A
  }

  return {
    data,
    width,
    height,
    colorSpace: 'srgb',
  } as ImageData;
}

/**
 * Creates a mock CanvasRenderingContext2D
 */
function createMockContext(width = 100, height = 100) {
  const imageData = createMockImageData(width, height);
  const mockGradient = {
    addColorStop: vi.fn(),
  };

  return {
    globalAlpha: 1.0,
    fillStyle: '',
    getImageData: vi.fn(() => imageData),
    putImageData: vi.fn(),
    drawImage: vi.fn(),
    createRadialGradient: vi.fn(() => mockGradient),
    fillRect: vi.fn(),
  };
}

describe('Image Effects', () => {
  describe('applyColorFilter', () => {
    it('should retrieve and update image data', () => {
      const canvas = createMockCanvas(10, 10);
      const context = createMockContext(10, 10);

      FX.applyColorFilter(canvas, context as any);

      expect(context.getImageData).toHaveBeenCalledWith(0, 0, 10, 10);
      expect(context.putImageData).toHaveBeenCalled();
    });

    it('should increase brightness of pixels', () => {
      const canvas = createMockCanvas(1, 1);
      const context = createMockContext(1, 1);
      const imageData = context.getImageData(0, 0, 1, 1);

      // Set a dark pixel (50, 50, 50)
      imageData.data[0] = 50;
      imageData.data[1] = 50;
      imageData.data[2] = 50;
      imageData.data[3] = 255;

      FX.applyColorFilter(canvas, context as any);

      // After brightness and contrast, values should be higher
      const newR = imageData.data[0];
      const newG = imageData.data[1];
      const newB = imageData.data[2];

      expect(newR).toBeGreaterThan(50);
      expect(newG).toBeGreaterThan(50);
      expect(newB).toBeGreaterThan(50);
    });

    it('should not modify alpha channel', () => {
      const canvas = createMockCanvas(1, 1);
      const context = createMockContext(1, 1);
      const imageData = context.getImageData(0, 0, 1, 1);

      imageData.data[3] = 128; // Semi-transparent

      FX.applyColorFilter(canvas, context as any);

      expect(imageData.data[3]).toBe(128); // Alpha unchanged
    });

    it('should handle edge case of black pixels', () => {
      const canvas = createMockCanvas(1, 1);
      const context = createMockContext(1, 1);
      const imageData = context.getImageData(0, 0, 1, 1);

      // Set black pixel
      imageData.data[0] = 0;
      imageData.data[1] = 0;
      imageData.data[2] = 0;

      expect(() => {
        FX.applyColorFilter(canvas, context as any);
      }).not.toThrow();
    });
  });

  describe('applyGrayscaleFilter', () => {
    it('should retrieve and update image data', () => {
      const canvas = createMockCanvas(10, 10);
      const context = createMockContext(10, 10);

      FX.applyGrayscaleFilter(canvas, context as any);

      expect(context.getImageData).toHaveBeenCalledWith(0, 0, 10, 10);
      expect(context.putImageData).toHaveBeenCalled();
    });

    it('should convert colored pixel to grayscale', () => {
      const canvas = createMockCanvas(1, 1);
      const context = createMockContext(1, 1);
      const imageData = context.getImageData(0, 0, 1, 1);

      // Set a red pixel
      imageData.data[0] = 255; // R
      imageData.data[1] = 0;   // G
      imageData.data[2] = 0;   // B
      imageData.data[3] = 255; // A

      FX.applyGrayscaleFilter(canvas, context as any);

      // After grayscale, R, G, B should be equal
      const r = imageData.data[0];
      const g = imageData.data[1];
      const b = imageData.data[2];

      expect(r).toBe(g);
      expect(g).toBe(b);
    });

    it('should make all RGB channels equal', () => {
      const canvas = createMockCanvas(1, 1);
      const context = createMockContext(1, 1);
      const imageData = context.getImageData(0, 0, 1, 1);

      // Set varied colors
      imageData.data[0] = 100;
      imageData.data[1] = 150;
      imageData.data[2] = 200;

      FX.applyGrayscaleFilter(canvas, context as any);

      expect(imageData.data[0]).toBe(imageData.data[1]);
      expect(imageData.data[1]).toBe(imageData.data[2]);
    });

    it('should preserve pure white', () => {
      const canvas = createMockCanvas(1, 1);
      const context = createMockContext(1, 1);
      const imageData = context.getImageData(0, 0, 1, 1);

      // White pixel
      imageData.data[0] = 255;
      imageData.data[1] = 255;
      imageData.data[2] = 255;

      FX.applyGrayscaleFilter(canvas, context as any);

      // Should remain white (or very close due to overexposure)
      expect(imageData.data[0]).toBeGreaterThan(250);
      expect(imageData.data[1]).toBeGreaterThan(250);
      expect(imageData.data[2]).toBeGreaterThan(250);
    });
  });

  describe('applyBlur', () => {
    it('should modify globalAlpha during blur', () => {
      const canvas = createMockCanvas(10, 10);
      const context = createMockContext(10, 10);

      expect(context.globalAlpha).toBe(1.0);

      FX.applyBlur(canvas, context as any);

      // Alpha should be reset after blur
      expect(context.globalAlpha).toBe(1.0);
    });

    it('should draw image multiple times with offsets', () => {
      const canvas = createMockCanvas(10, 10);
      const context = createMockContext(10, 10);

      FX.applyBlur(canvas, context as any);

      // Should call drawImage 3 times (offsets: -1, 0, 1)
      expect(context.drawImage).toHaveBeenCalledTimes(3);
      expect(context.drawImage).toHaveBeenCalledWith(canvas, -1, 0);
      expect(context.drawImage).toHaveBeenCalledWith(canvas, 0, 0);
      expect(context.drawImage).toHaveBeenCalledWith(canvas, 1, 0);
    });

    it('should reset globalAlpha to 1.0 after blur', () => {
      const canvas = createMockCanvas(10, 10);
      const context = createMockContext(10, 10);

      context.globalAlpha = 0.5; // Set during blur

      FX.applyBlur(canvas, context as any);

      expect(context.globalAlpha).toBe(1.0);
    });
  });

  describe('applyVignette', () => {
    it('should create two radial gradients', () => {
      const canvas = createMockCanvas(100, 100);
      const context = createMockContext(100, 100);

      FX.applyVignette(canvas, context as any);

      // Should create 2 gradients (black layer + white layer)
      expect(context.createRadialGradient).toHaveBeenCalledTimes(2);
    });

    it('should create gradient from center to corner', () => {
      const canvas = createMockCanvas(100, 100);
      const context = createMockContext(100, 100);

      FX.applyVignette(canvas, context as any);

      // Center should be at (50, 50) for 100x100 canvas
      const calls = (context.createRadialGradient as any).mock.calls;
      expect(calls[0][0]).toBe(50); // centerX
      expect(calls[0][1]).toBe(50); // centerY
    });

    it('should add color stops to gradients', () => {
      const canvas = createMockCanvas(100, 100);
      const context = createMockContext(100, 100);
      const mockGradient = context.createRadialGradient() as any;

      FX.applyVignette(canvas, context as any);

      // Each gradient should have 3 color stops
      expect(mockGradient.addColorStop).toHaveBeenCalled();
      expect(mockGradient.addColorStop.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should fill rect twice (black + white layers)', () => {
      const canvas = createMockCanvas(100, 100);
      const context = createMockContext(100, 100);

      FX.applyVignette(canvas, context as any);

      expect(context.fillRect).toHaveBeenCalledTimes(2);
      expect(context.fillRect).toHaveBeenCalledWith(0, 0, 100, 100);
    });

    it('should handle non-square canvas', () => {
      const canvas = createMockCanvas(200, 100);
      const context = createMockContext(200, 100);

      expect(() => {
        FX.applyVignette(canvas, context as any);
      }).not.toThrow();

      // Should still create gradients from center
      const calls = (context.createRadialGradient as any).mock.calls;
      expect(calls[0][0]).toBe(100); // centerX = 200/2
      expect(calls[0][1]).toBe(50);  // centerY = 100/2
    });
  });

  describe('FX object', () => {
    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(FX)).toBe(true);
    });

    it('should export all effect functions', () => {
      expect(FX).toHaveProperty('applyBlur');
      expect(FX).toHaveProperty('applyColorFilter');
      expect(FX).toHaveProperty('applyGrayscaleFilter');
      expect(FX).toHaveProperty('applyVignette');
    });

    it('should have functions that are callable', () => {
      expect(typeof FX.applyBlur).toBe('function');
      expect(typeof FX.applyColorFilter).toBe('function');
      expect(typeof FX.applyGrayscaleFilter).toBe('function');
      expect(typeof FX.applyVignette).toBe('function');
    });
  });

  describe('Integration: Multiple effects', () => {
    it('should apply multiple effects without errors', () => {
      const canvas = createMockCanvas(50, 50);
      const context = createMockContext(50, 50);

      expect(() => {
        FX.applyGrayscaleFilter(canvas, context as any);
        FX.applyBlur(canvas, context as any);
        FX.applyVignette(canvas, context as any);
      }).not.toThrow();
    });

    it('should maintain canvas size after all effects', () => {
      const canvas = createMockCanvas(100, 100);
      const context = createMockContext(100, 100);

      FX.applyColorFilter(canvas, context as any);
      FX.applyBlur(canvas, context as any);
      FX.applyVignette(canvas, context as any);

      expect(canvas.width).toBe(100);
      expect(canvas.height).toBe(100);
    });
  });
});
