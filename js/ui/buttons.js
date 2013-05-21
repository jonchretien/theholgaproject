define(function() {

  'use strict';

  /**
   * Builds button elements and logic.
   */
  var Buttons = {

    /**
     * Button that activates filter.
     */
    button: null,

    /**
     * Caches DOM elements and calls run() method.
     */
    init: function(footer, shell) {
      // cache DOM elements
      this.canvas = document.querySelector('canvas');
      this.context = this.canvas.getContext('2d');
      this.footer = footer;
      this.shell = shell;

      this.run();
    },

    /**
     * Runs application.
     */
    run: function() {
      this.buildInterface();
    },

    /**
     * Builds application interface.
     */
    buildInterface: function() {
      // create button element
      var btn = document.createElement('button');
      btn.setAttribute('id', 'js-btn-filter');
      btn.setAttribute('class', 'btn-filter');
      btn.setAttribute('disabled', 'disabled');
      btn.appendChild(document.createTextNode('Holgafy!'));

      // insert into DOM
      this.shell.insertBefore(btn, this.footer);

      // store reference to new elements
      this.button = document.getElementById('js-btn-filter');
    },

    /**
     * Binds event handlers.
     */
    bindEventHandlers: function() {
      this.button.addEventListener('click', this.applyFilter.bind(this), false);
    },

    /**
     * Removes event handlers.
     */
    removeEventHandlers: function() {
      this.button.removeEventListener('click', this.applyFilter, false);
    },

    /**
     * Applies black and white filter.
     *
     * @param {Object} event - The event triggered.
     */
    applyFilter: function(event) {
      event.preventDefault();

      var brightness;

      // retrieve image data
      var imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

      // retrieve color components of each pixel image (CanvasPixelArray - rgba)
      var data = imageData.data;

      // convert image to grayscale
      var len = data.length;
      for ( var i = 0; i < len; i += 4 ) {
        // calculate the brightness of each pixel and set the rgb components equal to the brightness
        brightness = 0.38 * data[i] + 0.5 * data[i + 1] + 0.18 * data[i + 2];
        data[i] = brightness;     // red
        data[i + 1] = brightness; // green
        data[i + 2] = brightness; // blue
      }

      // overwrite original image
      this.context.putImageData(imageData, 0, 0);

      // apply blur effect
      this.context.globalAlpha = 0.5;

      for ( var y = -1; y < 2; y += 1 ) {
        this.context.drawImage(this.canvas, y, 0);
      }

      // reset alpha
      this.context.globalAlpha = 1.0;

      this.applyVignette();
      return false;
    },

    /**
     * Applies vignette effect.
     * Credit to Robert Fleischmann's vintageJS - https://github.com/rendro/vintageJS/blob/master/src/vintage.js
     */
    applyVignette: function() {
      var gradient,
          outerRadius = Math.sqrt( Math.pow(this.canvas.width/2, 2) + Math.pow(this.canvas.height/2, 2) );

      gradient = this.context.createRadialGradient(this.canvas.width/2, this.canvas.height/2, 0, this.canvas.width/2, this.canvas.height/2, outerRadius);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.65, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,14)'); // black value
      this.context.fillStyle = gradient;
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

      gradient = this.context.createRadialGradient(this.canvas.width/2, this.canvas.height/2, 0, this.canvas.width/2, this.canvas.height/2, outerRadius);
      gradient.addColorStop(0, 'rgba(255,255,255,0.2)'); // white value
      gradient.addColorStop(0.65, 'rgba(255,255,255,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      this.context.fillStyle = gradient;
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.removeEventHandlers();
      this.insertSaveButton();
    },

    /**
     * Updates button functionality.
     */
    insertSaveButton: function() {
      this.button.innerHTML = 'Save Image';
      this.button.addEventListener('click', this.saveAsPNG.bind(this), false);
    },

    /**
     * Saves canvas image as data URL.
     * Encodes as base64 encoded PNG file.
     * from Canvas2Image, by Hongru Chenhr - https://github.com/hongru/canvas2image
     *
     * @param {Object} event - The event triggered.
     */
    saveAsPNG: function(event) {
      event.preventDefault();
      this.saveFile( this.canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream') );
    },

    /**
     * Saves the file to the user's download folder.
     *
     * @param {String} strData - base64 encoded PNG file.
     */
    saveFile: function(strData) {
      document.location.href = strData;
    }

  };

  return Buttons;

});
