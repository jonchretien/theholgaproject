/**
 * Image effects configuration constants
 *
 * These values have been tuned to create the classic Holga camera aesthetic:
 * - High contrast with slight overexposure
 * - Soft focus blur
 * - Heavy vignette darkening at edges
 */

/**
 * Color filter effect parameters
 */
export const COLOR_FILTER = {
  /**
   * Brightness multiplier (1.35 = 35% brighter)
   * Creates the overexposed look characteristic of Holga photos
   */
  brightness: 1.35,

  /**
   * Contrast multiplier (1.25 = 25% more contrast)
   * Range: [0..2], where 1 is neutral
   */
  contrast: 1.25,

  /**
   * Intercept value for contrast calculation
   * Calculated as: 128 * (1 - contrast)
   * This ensures contrast adjustment is centered around middle gray
   */
  get contrastIntercept(): number {
    return 128 * (1 - this.contrast);
  },
} as const;

/**
 * Grayscale filter effect parameters
 * Uses weighted RGB values for more natural black and white conversion
 */
export const GRAYSCALE_FILTER = {
  /**
   * Red channel weight (0.38 = 38%)
   * Lower than standard to reduce harsh skin tones
   */
  redWeight: 0.38,

  /**
   * Green channel weight (0.5 = 50%)
   * Highest weight as human eyes are most sensitive to green
   */
  greenWeight: 0.5,

  /**
   * Blue channel weight (0.18 = 18%)
   * Lower weight to prevent excessive blue in skies
   */
  blueWeight: 0.18,
} as const;

/**
 * Blur effect parameters
 * Creates the soft focus / lens imperfection characteristic of toy cameras
 */
export const BLUR_EFFECT = {
  /**
   * Alpha transparency during blur (0.5 = 50% transparent)
   * Lower values create stronger blur effect
   */
  alpha: 0.5,

  /**
   * Horizontal shift range for blur
   * Shifts the image by -1, 0, and +1 pixels horizontally
   */
  shiftStart: -1,
  shiftEnd: 2,
  shiftStep: 1,
} as const;

/**
 * Vignette effect parameters
 * Creates darkening at the edges, simulating lens falloff and light leaks
 */
export const VIGNETTE_EFFECT = {
  /**
   * Inner gradient stop position (0.65 = 65% from center)
   * Area inside this radius has no darkening
   */
  innerStop: 0.65,

  /**
   * Outer gradient stop position (1.0 = 100%, at edges)
   * Maximum darkening occurs here
   */
  outerStop: 1.0,

  /**
   * Black layer configuration
   * Creates the primary dark vignette at edges
   */
  blackLayer: {
    innerAlpha: 0, // Fully transparent at center
    transitionAlpha: 0, // No darkening at innerStop
    outerAlpha: 14, // Strong darkening at edges (max 255)
  },

  /**
   * White layer configuration
   * Adds subtle glow in center to enhance contrast with edges
   */
  whiteLayer: {
    innerAlpha: 0.2, // Slight glow at center (20% opacity)
    transitionAlpha: 0, // Fades to nothing at innerStop
    outerAlpha: 0, // No effect at edges
  },
} as const;

/**
 * Combined Holga effect preset
 * Defines which effects are applied for black & white Holga style
 */
export const HOLGA_BW_PRESET = {
  grayscale: true,
  blur: true,
  vignette: true,
} as const;

/**
 * Combined Holga color effect preset
 * Defines which effects are applied for color Holga style
 */
export const HOLGA_COLOR_PRESET = {
  colorFilter: true,
  blur: true,
  vignette: true,
} as const;
