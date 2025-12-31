/**
 * Unit tests for browser support detection
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isTouchDevice,
  hasCanvasSupport,
  hasDragAndDropSupport,
  hasFileReaderSupport,
  hasRequiredFeatures,
  getMissingFeatures,
} from './support';

describe('Browser Support Detection', () => {
  describe('isTouchDevice', () => {
    it('should return true if ontouchstart exists in window', () => {
      const originalTouch = 'ontouchstart' in window;

      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', {
        value: {},
        configurable: true,
      });

      expect(isTouchDevice()).toBe(true);

      // Cleanup
      if (!originalTouch) {
        delete (window as any).ontouchstart;
      }
    });

    it('should return true if maxTouchPoints > 0', () => {
      const originalMaxTouchPoints = window.navigator.maxTouchPoints;

      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true,
      });

      expect(isTouchDevice()).toBe(true);

      // Cleanup
      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: originalMaxTouchPoints,
        configurable: true,
      });
    });

    it('should return false on non-touch devices', () => {
      // In testing environment without touch
      const originalMaxTouchPoints = window.navigator.maxTouchPoints;

      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true,
      });

      const hasOntouchstart = 'ontouchstart' in window;

      if (!hasOntouchstart) {
        expect(isTouchDevice()).toBe(false);
      }

      // Cleanup
      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: originalMaxTouchPoints,
        configurable: true,
      });
    });
  });

  describe('hasCanvasSupport', () => {
    it('should check for getContext method', () => {
      const createElement = document.createElement;
      const mockCanvas = {
        getContext: vi.fn(() => ({})),
      };

      vi.spyOn(document, 'createElement').mockReturnValue(
        mockCanvas as any
      );

      expect(hasCanvasSupport()).toBe(true);
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');

      vi.restoreAllMocks();
    });

    it('should return false if getContext is not available', () => {
      const createElement = document.createElement;
      const mockCanvas = {} as any;

      vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);

      expect(hasCanvasSupport()).toBe(false);

      vi.restoreAllMocks();
    });
  });

  describe('hasDragAndDropSupport', () => {
    it('should return true if draggable attribute exists', () => {
      const createElement = document.createElement;
      const mockDiv = { draggable: true } as any;

      vi.spyOn(document, 'createElement').mockReturnValue(mockDiv);

      expect(hasDragAndDropSupport()).toBe(true);

      vi.restoreAllMocks();
    });

    it('should return true if ondragstart and ondrop exist', () => {
      const createElement = document.createElement;
      const mockDiv = {
        ondragstart: null,
        ondrop: null,
      } as any;

      vi.spyOn(document, 'createElement').mockReturnValue(mockDiv);

      expect(hasDragAndDropSupport()).toBe(true);

      vi.restoreAllMocks();
    });

    it('should return false if neither condition is met', () => {
      const createElement = document.createElement;
      const mockDiv = {} as any;

      vi.spyOn(document, 'createElement').mockReturnValue(mockDiv);

      expect(hasDragAndDropSupport()).toBe(false);

      vi.restoreAllMocks();
    });
  });

  describe('hasFileReaderSupport', () => {
    it('should return true if File and FileReader exist', () => {
      expect(hasFileReaderSupport()).toBe(true);
    });

    it('should return false if File is not available', () => {
      const originalFile = window.File;

      (window as any).File = undefined;

      expect(hasFileReaderSupport()).toBe(false);

      window.File = originalFile;
    });

    it('should return false if FileReader is not available', () => {
      const originalFileReader = window.FileReader;

      (window as any).FileReader = undefined;

      expect(hasFileReaderSupport()).toBe(false);

      window.FileReader = originalFileReader;
    });
  });

  describe('hasRequiredFeatures', () => {
    it('should return false if any feature is missing', () => {
      // Mock Canvas as unsupported
      vi.spyOn(document, 'createElement').mockReturnValue({} as any);

      expect(hasRequiredFeatures()).toBe(false);

      vi.restoreAllMocks();
    });
  });

  describe('getMissingFeatures', () => {
    it('should list missing features', () => {
      // Mock Canvas as unsupported
      const mockCanvas = {} as any;
      vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);

      const missing = getMissingFeatures();

      expect(missing).toContain('Canvas API');
      expect(missing).toContain('Drag and Drop API');
      expect(missing.length).toBeGreaterThan(0);

      vi.restoreAllMocks();
    });

    it('should identify specific missing features', () => {
      // Mock only FileReader as missing
      const originalFileReader = window.FileReader;
      (window as any).FileReader = undefined;

      const missing = getMissingFeatures();
      expect(missing).toContain('FileReader API');

      window.FileReader = originalFileReader;
    });
  });
});
