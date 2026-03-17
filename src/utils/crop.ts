/**
 * Pure crop math functions for aspect-ratio-correct rendering
 */

export interface CropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/**
 * Computes a center-crop rect where the shorter dimension fills the canvas.
 * The resulting rect is a square region from the source image.
 */
export function computeCoverCrop(
  imgW: number,
  imgH: number
): CropRect {
  const side = Math.min(imgW, imgH);
  const sx = (imgW - side) / 2;
  const sy = (imgH - side) / 2;
  return { sx, sy, sw: side, sh: side };
}

/**
 * Shifts a crop rect by delta in source-image coordinates, clamped to image bounds.
 */
export function applyOffset(
  crop: CropRect,
  deltaX: number,
  deltaY: number,
  imgW: number,
  imgH: number
): CropRect {
  let sx = crop.sx + deltaX;
  let sy = crop.sy + deltaY;

  // Clamp so crop rect stays within image bounds
  sx = Math.max(0, Math.min(sx, imgW - crop.sw));
  sy = Math.max(0, Math.min(sy, imgH - crop.sh));

  return { sx, sy, sw: crop.sw, sh: crop.sh };
}
