/**
 * Applies color filter.
 */
function applyColorFilter(canvas, context) {
  const brightness = 1.35;

  // retrieve image data
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  // retrieve color components of each pixel image (CanvasPixelArray - rgba)
  const data = imageData.data;

  // brightened values need to be between 0 and 255
  const constrainColorVal = val => Math.max(0, Math.min(255, val));

  // https://stackoverflow.com/questions/10521978/html5-canvas-image-contrast
  const contrast = 1.25; // range: [0..2]
  const intercept = 128 * (1 - contrast);

  /**
   * Calculate the brightness of each pixel
   * and set the rgb components equal to the brightness
   */
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightenedRed = constrainColorVal(brightness * r);
    const brightenedGreen = constrainColorVal(brightness * g);
    const brightenedBlue = constrainColorVal(brightness * b);
    data[i] = brightenedRed * contrast + intercept;
    data[i + 1] = brightenedGreen * contrast + intercept;
    data[i + 2] = brightenedBlue * contrast + intercept;
  }

  // overwrite original image
  context.putImageData(imageData, 0, 0);
}

/**
 * Applies black and white filter.
 */
function applyGrayscaleFilter(canvas, context) {
  // retrieve image data
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  // retrieve color components of each pixel image (CanvasPixelArray - rgba)
  const data = imageData.data;

  /**
   * Calculate the brightness of each pixel
   * and set the rgb components equal to the brightness
   */
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = 0.38 * r + 0.5 * g + 0.18 * b;
    data[i] = data[i + 1] = data[i + 2] = brightness;
  }

  // overwrite original image
  context.putImageData(imageData, 0, 0);
}

/**
 * Applies blur effect.
 */
function applyBlur(canvas, context) {
  // lower alpha
  context.globalAlpha = 0.5;

  // shift canvas
  for (let y = -1; y < 2; y += 1) {
    context.drawImage(canvas, y, 0);
  }

  // reset alpha
  context.globalAlpha = 1.0;
}

/**
 * Applies vignette effect.
 * Credit to Robert Fleischmann's vintageJS
 * https://github.com/rendro/vintageJS/blob/master/src/vintage.js
 */
function applyVignette(canvas, context) {
  const outerRadius = Math.sqrt(
    Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2)
  );

  let gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    outerRadius
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.65, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,14)'); // black value
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    outerRadius
  );
  gradient.addColorStop(0, 'rgba(255,255,255,0.2)'); // white value
  gradient.addColorStop(0.65, 'rgba(255,255,255,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

const FX = {
  applyBlur,
  applyColorFilter,
  applyGrayscaleFilter,
  applyVignette,
};

export default Object.freeze(FX);
