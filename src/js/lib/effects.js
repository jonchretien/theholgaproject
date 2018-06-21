/**
   * Builds button elements and logic.
   */
const FX = {
  /**
     * Applies black and white filter.
     */
  applyGrayscaleFilter: function(canvas, context) {
    let brightness;

    // retrieve image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // retrieve color components of each pixel image (CanvasPixelArray - rgba)
    const data = imageData.data;

    // convert image to grayscale
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      // calculate the brightness of each pixel and set the rgb components equal to the brightness
      brightness = 0.38 * data[i] + 0.5 * data[i + 1] + 0.18 * data[i + 2];
      data[i] = brightness; // red
      data[i + 1] = brightness; // green
      data[i + 2] = brightness; // blue
    }

    // overwrite original image
    context.putImageData(imageData, 0, 0);

    return false;
  },

  /**
     * Applies blur effect.
     */
  applyBlur: function(canvas, context) {
    // lower alpha
    context.globalAlpha = 0.5;

    // shift canvas
    for (let y = -1; y < 2; y += 1) {
      context.drawImage(canvas, y, 0);
    }

    // reset alpha
    context.globalAlpha = 1.0;
  },

  /**
     * Applies vignette effect.
     * Credit to Robert Fleischmann's vintageJS - https://github.com/rendro/vintageJS/blob/master/src/vintage.js
     */
  applyVignette: function(canvas, context) {
    const outerRadius = Math.sqrt(
      Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2)
    );

    const gradient = context.createRadialGradient(
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
  },
};

export default FX;
