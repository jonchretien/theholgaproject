/**
 * @author Jon Chretien
 * @version 2.0.1
 * @overview handles photo filter logic
 * @copyright (c)2013 Jon Chretien
 */

(function( window, document, undefined ) {

  'use strict';

  THP.FilterHandler = {

    applyFilter: function(event) {

      event.preventDefault();

      var brightness,
          imageData = THP.InterfaceBuilder.context.getImageData(0, 0, THP.InterfaceBuilder.canvas.width, THP.InterfaceBuilder.canvas.height), // retrieve image data
          data = imageData.data, // retrieve color components of each pixel image (CanvasPixelArray - rgba)
          len = data.length;

      // convert image to grayscale
      for (var i = 0; i < len; i += 4) {
        // calculate the brightness of each pixel and set the rgb components equal to the brightness
        brightness = 0.38 * data[i] + 0.5 * data[i + 1] + 0.18 * data[i + 2];
        data[i] = brightness;     // red
        data[i + 1] = brightness; // green
        data[i + 2] = brightness; // blue
      }

      // overwrite original image
      THP.InterfaceBuilder.context.putImageData(imageData, 0, 0);

      // apply blur effect
      THP.InterfaceBuilder.context.globalAlpha = 0.5;

      for (var y = -1; y < 2; y += 1) {
        THP.InterfaceBuilder.context.drawImage(THP.InterfaceBuilder.canvas, y, 0);
      }

      // reset alpha
      THP.InterfaceBuilder.context.globalAlpha = 1.0;

      THP.FilterHandler.applyVignette();
      return false;
    },

    applyVignette: function() {
      // from vintageJS, by Robert Fleischmann - https://github.com/rendro/vintageJS/blob/master/src/vintage.js
      var gradient, outerRadius = Math.sqrt( Math.pow(THP.InterfaceBuilder.canvas.width/2, 2) + Math.pow(THP.InterfaceBuilder.canvas.height/2, 2) );

      gradient = THP.InterfaceBuilder.context.createRadialGradient(THP.InterfaceBuilder.canvas.width/2, THP.InterfaceBuilder.canvas.height/2, 0, THP.InterfaceBuilder.canvas.width/2, THP.InterfaceBuilder.canvas.height/2, outerRadius);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.65, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,14)'); // black value
      THP.InterfaceBuilder.context.fillStyle = gradient;
      THP.InterfaceBuilder.context.fillRect(0, 0, THP.InterfaceBuilder.canvas.width, THP.InterfaceBuilder.canvas.height);

      gradient = THP.InterfaceBuilder.context.createRadialGradient(THP.InterfaceBuilder.canvas.width/2, THP.InterfaceBuilder.canvas.height/2, 0, THP.InterfaceBuilder.canvas.width/2, THP.InterfaceBuilder.canvas.height/2, outerRadius);
      gradient.addColorStop(0, 'rgba(255,255,255,0.2)'); // white value
      gradient.addColorStop(0.65, 'rgba(255,255,255,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      THP.InterfaceBuilder.context.fillStyle = gradient;
      THP.InterfaceBuilder.context.fillRect(0, 0, THP.InterfaceBuilder.canvas.width, THP.InterfaceBuilder.canvas.height);

      THP.InterfaceBuilder.removeEventHandlers();

      // swap button
      THP.InterfaceBuilder.button.innerHTML = 'Save Image';
      THP.InterfaceBuilder.button.addEventListener('click', THP.FileSaver.saveAsPNG, true);
    }

  };

})( window, document );
