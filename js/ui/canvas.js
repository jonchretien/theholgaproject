define(['heading', 'buttons'], function(Heading, Buttons) {

  'use strict';

  /**
   * Builds canvas element and logic
   */
  var Canvas = {

    /**
     * Canvas element.
     */
    canvas: null,

    /**
     * Canvas 2d context.
     */
    context: null,

    /**
     * Caches DOM elements and calls run() method.
     */
    init: function(footer, shell) {
      // cache DOM elements
      this.footer = footer;
      this.shell = shell;

      this.run();
    },

    /**
     * Runs application.
     */
    run: function() {
      this.buildInterface();
      this.bindEventHandlers();
    },

    /**
     * Builds application interface.
     */
    buildInterface: function() {
      Heading.render('instructions');

      // create canvas element
      var cnvs = document.createElement('canvas');
      cnvs.setAttribute('width', 620);
      cnvs.setAttribute('height', 620);

      // insert into DOM
      this.shell.insertBefore(cnvs, this.footer);

      // store reference to new elements
      this.canvas = this.shell.querySelector('canvas');
      this.context = this.canvas.getContext('2d');
    },

    /**
     * Binds event handlers.
     */
    bindEventHandlers: function() {
      this.canvas.addEventListener('dragover', this.addHoverClass, false );
      this.canvas.addEventListener('dragend', this.removeHoverClass, false );
      document.documentElement.addEventListener('drop', this.dropElement.bind(this), true );
    },

    /**
     * Removes event handlers.
     */
    removeEventHandlers: function() {
      this.canvas.removeEventListener('dragover', this.addHoverClass, false );
      this.canvas.removeEventListener('dragend', this.removeHoverClass, false );
      document.documentElement.removeEventListener('drop', this.dropElement, true );
    },

    /**
     * Adds hover class to canvas.
     *
     * @param {Object} event - The event triggered.
     */
    addHoverClass: function(event) {
      event.preventDefault();
      event.target.classList.add('hover');
    },

    /**
     * Removes hover class from canvas.
     *
     * @param {Object} event - The event triggered.
     */
    removeHoverClass: function(event) {
      event.preventDefault();
      event.target.classList.remove('hover');
    },

    /**
     * Drops image onto canvas.
     *
     * @param {Object} event - The event triggered.
     */
    dropElement: function(event) {
      event.preventDefault();
      this.canvas.classList.remove('hover');

      // check for error message and remove if it exists
      if ( this.shell.querySelector('.error') ) {
        this.shell.removeChild( this.shell.querySelector('.error') );
      }

      // filelist (an array-like sequence of file objects)
      var file = event.dataTransfer.files[0];

      // instantiate a FileReader object to read its contents into memory
      var reader = new FileReader();

      // save reference to 'this'
      var self = this;

      var imageObject;

      // capture the file information.
      reader.onload = function (event) {
        imageObject = new Image();

        // clear canvas in case another image exists
        self.context.clearRect ( 0 , 0, self.canvas.width, self.canvas.height );

        // load image from data url
        imageObject.onload = function() {
          self.context.drawImage(imageObject, 0, 0, 620, 620);
        };

        imageObject.src = event.target.result;

      };

      reader.onerror = this.errorHandler;

      // read in the image file as a data URL.
      reader.readAsDataURL(file);

      // trigger button logic
      Buttons.button.removeAttribute('disabled', 'disabled');
      Buttons.bindEventHandlers();
    }

  };

  return Canvas;

});
