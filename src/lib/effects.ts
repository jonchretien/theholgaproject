/**
 * Image effects module for applying Holga-style filters to canvas images
 *
 * All effects are applied in-place, mutating the canvas context's image data.
 * Effects use configuration values from @/config/effects for consistency.
 */

import {
  COLOR_FILTER,
  GRAYSCALE_FILTER,
  BLUR_EFFECT,
  VIGNETTE_EFFECT,
} from '@/config/effects';

/**
 * Type for HTML Canvas element
 */
export type Canvas = HTMLCanvasElement;

/**
 * Type for Canvas 2D rendering context
 */
export type CanvasContext = CanvasRenderingContext2D;

/**
 * Effect function signature
 * All effects take canvas and context, and mutate the context in-place
 */
export type EffectFunction = (canvas: Canvas, context: CanvasContext) => void;

/**
 * Interface for the effects module
 */
export interface Effects {
  applyBlur: EffectFunction;
  applyColorFilter: EffectFunction;
  applyGrayscaleFilter: EffectFunction;
  applyVignette: EffectFunction;
}

/**
 * Constrains a color value to valid range [0, 255]
 *
 * @param value - The color value to constrain
 * @returns Value clamped to [0, 255]
 */
function constrainColorValue(value: number): number {
  return Math.max(0, Math.min(255, value));
}

/**
 * Applies color filter effect
 *
 * Increases brightness and contrast to create the overexposed,
 * high-contrast look characteristic of Holga photos.
 *
 * @param canvas - The canvas element
 * @param context - The 2D rendering context
 *
 * @example
 * ```typescript
 * const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
 * const ctx = canvas.getContext('2d')!;
 * applyColorFilter(canvas, ctx);
 * ```
 */
function applyColorFilter(canvas: Canvas, context: CanvasContext): void {
  const { brightness, contrast, contrastIntercept } = COLOR_FILTER;

  // Retrieve image data
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Process each pixel (RGBA = 4 values per pixel)
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Alpha (data[i + 3]) is not modified

    // Apply brightness then contrast
    const brightenedRed = constrainColorValue(brightness * r);
    const brightenedGreen = constrainColorValue(brightness * g);
    const brightenedBlue = constrainColorValue(brightness * b);

    data[i] = brightenedRed * contrast + contrastIntercept;
    data[i + 1] = brightenedGreen * contrast + contrastIntercept;
    data[i + 2] = brightenedBlue * contrast + contrastIntercept;
  }

  // Write modified data back to canvas
  context.putImageData(imageData, 0, 0);
}

/**
 * Applies grayscale filter effect
 *
 * Converts image to black and white using weighted RGB values
 * for more natural-looking monochrome conversion.
 *
 * @param canvas - The canvas element
 * @param context - The 2D rendering context
 *
 * @example
 * ```typescript
 * applyGrayscaleFilter(canvas, ctx);
 * ```
 */
function applyGrayscaleFilter(canvas: Canvas, context: CanvasContext): void {
  const { redWeight, greenWeight, blueWeight } = GRAYSCALE_FILTER;

  // Retrieve image data
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Process each pixel
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate weighted brightness (slightly > 1.0 for Holga overexposure)
    const brightness = redWeight * r + greenWeight * g + blueWeight * b;

    // Set all RGB channels to same value (grayscale)
    data[i] = data[i + 1] = data[i + 2] = brightness;
  }

  // Write modified data back to canvas
  context.putImageData(imageData, 0, 0);
}

/**
 * Applies blur effect
 *
 * Creates soft focus by drawing the canvas offset with reduced opacity.
 * Simulates the lens imperfections of toy cameras.
 *
 * @param canvas - The canvas element
 * @param context - The 2D rendering context
 *
 * @example
 * ```typescript
 * applyBlur(canvas, ctx);
 * ```
 */
function applyBlur(canvas: Canvas, context: CanvasContext): void {
  const { alpha, shiftStart, shiftEnd, shiftStep } = BLUR_EFFECT;

  // Reduce alpha for blur effect
  context.globalAlpha = alpha;

  // Draw canvas shifted horizontally to create blur
  for (let offset = shiftStart; offset < shiftEnd; offset += shiftStep) {
    context.drawImage(canvas, offset, 0);
  }

  // Reset alpha to normal
  context.globalAlpha = 1.0;
}

/**
 * Applies vignette effect
 *
 * Darkens the edges and corners of the image using radial gradients,
 * simulating lens falloff and light leaks.
 *
 * Credit: Inspired by Robert Fleischmann's vintageJS
 * https://github.com/rendro/vintageJS
 *
 * @param canvas - The canvas element
 * @param context - The 2D rendering context
 *
 * @example
 * ```typescript
 * applyVignette(canvas, ctx);
 * ```
 */
function applyVignette(canvas: Canvas, context: CanvasContext): void {
  const { innerStop, outerStop, blackLayer, whiteLayer } = VIGNETTE_EFFECT;

  // Calculate radius from center to corner
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const outerRadius = Math.sqrt(
    Math.pow(centerX, 2) + Math.pow(centerY, 2)
  );

  // Create black vignette (darkens edges)
  let gradient = context.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    outerRadius
  );
  gradient.addColorStop(
    0,
    `rgba(0,0,0,${blackLayer.innerAlpha})`
  );
  gradient.addColorStop(
    innerStop,
    `rgba(0,0,0,${blackLayer.transitionAlpha})`
  );
  gradient.addColorStop(
    outerStop,
    `rgba(0,0,0,${blackLayer.outerAlpha})`
  );
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Create white glow (brightens center)
  gradient = context.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    outerRadius
  );
  gradient.addColorStop(
    0,
    `rgba(255,255,255,${whiteLayer.innerAlpha})`
  );
  gradient.addColorStop(
    innerStop,
    `rgba(255,255,255,${whiteLayer.transitionAlpha})`
  );
  gradient.addColorStop(
    outerStop,
    `rgba(255,255,255,${whiteLayer.outerAlpha})`
  );
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Effects module object
 * All effect functions exported as a frozen object
 */
const FX: Effects = {
  applyBlur,
  applyColorFilter,
  applyGrayscaleFilter,
  applyVignette,
};

/**
 * Frozen effects object (prevents accidental modification)
 */
export default Object.freeze(FX);
