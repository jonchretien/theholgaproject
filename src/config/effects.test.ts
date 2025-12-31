/**
 * Unit tests for effects configuration
 */
import { describe, it, expect } from 'vitest';
import {
  COLOR_FILTER,
  GRAYSCALE_FILTER,
  BLUR_EFFECT,
  VIGNETTE_EFFECT,
  HOLGA_BW_PRESET,
  HOLGA_COLOR_PRESET,
} from './effects';

describe('Effects Configuration', () => {
  describe('COLOR_FILTER', () => {
    it('should have brightness greater than 1 for overexposure effect', () => {
      expect(COLOR_FILTER.brightness).toBeGreaterThan(1);
    });

    it('should have contrast in valid range', () => {
      expect(COLOR_FILTER.contrast).toBeGreaterThan(0);
      expect(COLOR_FILTER.contrast).toBeLessThanOrEqual(2);
    });

    it('should calculate contrast intercept correctly', () => {
      const expected = 128 * (1 - COLOR_FILTER.contrast);
      expect(COLOR_FILTER.contrastIntercept).toBe(expected);
    });
  });

  describe('GRAYSCALE_FILTER', () => {
    it('should have RGB weights that sum to approximately 1 (slight overexposure)', () => {
      const sum =
        GRAYSCALE_FILTER.redWeight +
        GRAYSCALE_FILTER.greenWeight +
        GRAYSCALE_FILTER.blueWeight;
      // Sum is 1.06 to create slight brightness boost (Holga aesthetic)
      expect(sum).toBeCloseTo(1.06, 2);
    });

    it('should have all positive weights', () => {
      expect(GRAYSCALE_FILTER.redWeight).toBeGreaterThan(0);
      expect(GRAYSCALE_FILTER.greenWeight).toBeGreaterThan(0);
      expect(GRAYSCALE_FILTER.blueWeight).toBeGreaterThan(0);
    });

    it('should weight green channel highest (human eye sensitivity)', () => {
      expect(GRAYSCALE_FILTER.greenWeight).toBeGreaterThan(
        GRAYSCALE_FILTER.redWeight
      );
      expect(GRAYSCALE_FILTER.greenWeight).toBeGreaterThan(
        GRAYSCALE_FILTER.blueWeight
      );
    });
  });

  describe('BLUR_EFFECT', () => {
    it('should have alpha between 0 and 1', () => {
      expect(BLUR_EFFECT.alpha).toBeGreaterThan(0);
      expect(BLUR_EFFECT.alpha).toBeLessThanOrEqual(1);
    });

    it('should have valid shift range', () => {
      expect(BLUR_EFFECT.shiftStart).toBeLessThan(BLUR_EFFECT.shiftEnd);
      expect(BLUR_EFFECT.shiftStep).toBeGreaterThan(0);
    });
  });

  describe('VIGNETTE_EFFECT', () => {
    it('should have inner stop less than outer stop', () => {
      expect(VIGNETTE_EFFECT.innerStop).toBeLessThan(
        VIGNETTE_EFFECT.outerStop
      );
    });

    it('should have stops in valid range [0, 1]', () => {
      expect(VIGNETTE_EFFECT.innerStop).toBeGreaterThanOrEqual(0);
      expect(VIGNETTE_EFFECT.innerStop).toBeLessThanOrEqual(1);
      expect(VIGNETTE_EFFECT.outerStop).toBeGreaterThanOrEqual(0);
      expect(VIGNETTE_EFFECT.outerStop).toBeLessThanOrEqual(1);
    });

    it('should have black layer with increasing darkness', () => {
      const { blackLayer } = VIGNETTE_EFFECT;
      expect(blackLayer.innerAlpha).toBeLessThanOrEqual(
        blackLayer.transitionAlpha
      );
      expect(blackLayer.transitionAlpha).toBeLessThanOrEqual(
        blackLayer.outerAlpha
      );
    });

    it('should have white layer with decreasing brightness from center', () => {
      const { whiteLayer } = VIGNETTE_EFFECT;
      expect(whiteLayer.innerAlpha).toBeGreaterThanOrEqual(
        whiteLayer.transitionAlpha
      );
      expect(whiteLayer.transitionAlpha).toBeGreaterThanOrEqual(
        whiteLayer.outerAlpha
      );
    });
  });

  describe('Effect Presets', () => {
    it('should have B&W preset with grayscale enabled', () => {
      expect(HOLGA_BW_PRESET.grayscale).toBe(true);
    });

    it('should have color preset with color filter enabled', () => {
      expect(HOLGA_COLOR_PRESET.colorFilter).toBe(true);
    });

    it('should apply blur to both presets', () => {
      expect(HOLGA_BW_PRESET.blur).toBe(true);
      expect(HOLGA_COLOR_PRESET.blur).toBe(true);
    });

    it('should apply vignette to both presets', () => {
      expect(HOLGA_BW_PRESET.vignette).toBe(true);
      expect(HOLGA_COLOR_PRESET.vignette).toBe(true);
    });
  });
});
