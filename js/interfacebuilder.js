/**
 * @author Jon Chretien
 * @version 2.0.7
 * @overview build application interface
 * @copyright (c)2013 Jon Chretien
 */

(function( window, document, undefined ) {

  'use strict';

  THP.InterfaceBuilder = {

    /**
     * Button that activates filter.
     */
    button: null,

    /**
     * Canvas element.
     */
    canvas: null,

    /**
     * Canvas 2d context.
     */
    context: null,

    /**
     * Contains defaults for DOM ids.
     */
    defaults: {
      footer: 'js-siteFooter',
      instructions: 'js-instructions',
      shell: 'js-shell'
    },

    /**
     * Caches DOM elements and calls run() method.
     */
    init: function() {
      // cache DOM elements
      this.footer = document.getElementById(this.defaults.footer);
      this.instructions = document.getElementById(this.defaults.instructions);
      this.shell = document.getElementById(this.defaults.shell);

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
      this.instructions.innerHTML = 'Drag a photo from your desktop into the box below';

      // create canvas element
      var cnvs = document.createElement('canvas');
      cnvs.setAttribute('width', 620);
      cnvs.setAttribute('height', 620);

      // create button element
      var btn = document.createElement('a');
      btn.setAttribute('id', 'js-btn-filter');
      btn.setAttribute('class', 'btn-filter disabled');
      btn.setAttribute('href', '#');
      btn.appendChild(document.createTextNode('Holgafy!'));

      // insert into DOM
      this.shell.insertBefore(cnvs, this.footer);
      this.shell.insertBefore(btn, this.footer);

      // store reference to new elements
      this.button = document.getElementById('js-btn-filter');
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
      this.button.addEventListener('click', THP.FilterHandler.applyFilter, false);
    },

    /**
     * Removes event handlers.
     */
    removeEventHandlers: function() {
      this.canvas.removeEventListener('dragover', this.addHoverClass, false );
      this.canvas.removeEventListener('dragend', this.removeHoverClass, false );
      document.documentElement.removeEventListener('drop', this.dropElement, true );
      this.button.removeEventListener('click', THP.FilterHandler.applyFilter, false);
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

      var file = event.dataTransfer.files[0], // filelist (an array-like sequence of file objects)
          imageObject,
          reader = new FileReader(); // instantiate a FileReader object to read its contents into memory

      // save reference to 'this'
      var self = this;

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

      this.button.classList.remove('disabled');
    }

  };

})( window, document );
