/*
* @author Jon Chretien
* @version 2.0.0
* @overview build application interface
* @copyright (c)2012 Jon Chretien
*/

(function( window, document, THP, undefined ) {
  
  'use strict';
  
  THP.InterfaceBuilder = {
    
    button: null,
    canvas: null,
    context: null,
    shell: document.getElementById('js-shell'),

    init: function() {
      this.buildInterface();
    },

    buildInterface: function() {
      var footer = this.shell.querySelector('footer');
      
      this.shell.querySelector('h2').innerHTML = 'Drag a photo from your desktop into the box below';

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
      this.shell.insertBefore(cnvs, footer);
      this.shell.insertBefore(btn, footer);

      // store reference to new elements
      this.button = document.getElementById('js-btn-filter');
      this.canvas = this.shell.querySelector('canvas');
      this.context = this.canvas.getContext('2d');

      this.setEventHandlers();
    },

    setEventHandlers: function() {
      this.canvas.addEventListener('dragover', this.addHoverClass, false );
      this.canvas.addEventListener('dragend', this.removeHoverClass, false );
      document.documentElement.addEventListener('drop', this.dropElement, true );
      this.button.addEventListener('click', THP.FilterHandler.applyFilter, false);
    },

    addHoverClass: function(event) {
      event.preventDefault();
      event.target.classList.add('hover');
    },

    removeHoverClass: function(event) {
      event.preventDefault();
      event.target.classList.remove('hover');
    },

    removeEventHandlers: function() {
      this.canvas.removeEventListener('dragover', this.addHoverClass, false );
      this.canvas.removeEventListener('dragend', this.removeHoverClass, false );
      document.documentElement.removeEventListener('drop', this.dropElement, true );
      this.button.removeEventListener('click', THP.FilterHandler.applyFilter, false);
    },

    dropElement: function(event) {
      event.preventDefault();
      THP.InterfaceBuilder.canvas.classList.remove('hover');

      // check for error message and remove if it exists
      if ( THP.InterfaceBuilder.shell.querySelector('.error') ) {
        THP.InterfaceBuilder.shell.removeChild( THP.InterfaceBuilder.shell.querySelector('.error') );
      }

      var file = event.dataTransfer.files[0], // filelist (an array-like sequence of file objects)
          imageObject,
          reader = new FileReader(); // instantiate a FileReader object to read its contents into memory

      // capture the file information.
      reader.onload = function (event) {
        imageObject = new Image();

        // clear canvas in case another image exists
        THP.InterfaceBuilder.context.clearRect ( 0 , 0, THP.InterfaceBuilder.canvas.width, THP.InterfaceBuilder.canvas.height );

        // load image from data url
        imageObject.onload = function() {
          THP.InterfaceBuilder.context.drawImage(imageObject, 0, 0, 620, 620);
        };

        imageObject.src = event.target.result;

      };

      reader.onerror = THP.InterfaceBuilder.errorHandler;

      // read in the image file as a data URL.
      reader.readAsDataURL(file);

      THP.InterfaceBuilder.button.classList.remove('disabled');
    }

  };
  
})( window, document, window.THP );