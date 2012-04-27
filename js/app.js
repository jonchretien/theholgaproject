/*
* @author Jon Chretien
* @version 0.1.0
* @requires Support for canvas, drag and drop api, file reader api, and file list api.
* @overview Applies psuedo Holga filter to photos dropped in browser.
* @copyright (c)2012 Jon Chretien
*/

var THP = THP || {};

/* group App */

THP.App = (function() {

  var button,
      canvas,
      context,
      imageObject,
      shell = document.getElementById('js-shell'),
      footer = shell.querySelector('footer'),
      strData,
      strDownloadMime;

  function init() {
    buildInterface();
  }

  function buildInterface() {
    shell.querySelector('h2').innerHTML = 'Drag a photo from your desktop into the box below';

    // create canvas element
    var cnvs = document.createElement('canvas');
    cnvs.setAttribute('width', 620);
    cnvs.setAttribute('height', 620);

    // create button element
    var btn = document.createElement('a');
    btn.setAttribute('id', 'js-btn-filter');
    btn.setAttribute('class', 'btn-filter disabled');
    btn.setAttribute('target', '_blank');
    btn.appendChild(document.createTextNode('Holgafy!'));

    // insert into DOM
    shell.insertBefore(cnvs, footer);
    shell.insertBefore(btn, footer);

    setEventHandlers();
  }

  function setEventHandlers() {
    button = document.getElementById('js-btn-filter');
    canvas = shell.querySelector('canvas');
    context = canvas.getContext('2d');
    canvas.addEventListener('dragover', function(event) {
      event.preventDefault();
      this.classList.add('hover');
    }, false );
    canvas.addEventListener('dragend', function(event) {
      event.preventDefault();
      this.classList.remove('hover');
    }, false );
    document.documentElement.addEventListener('drop', dropElement, true );
    button.addEventListener('click', applyFilter, false);
  }

  function dropElement(event) {
    event.preventDefault();
    canvas.classList.remove('hover');

    // check for error message and remove if it exists
    if ( shell.querySelector('.error') ) {
      shell.removeChild( shell.querySelector('.error') );
    }

    var file = event.dataTransfer.files[0], // filelist (an array-like sequence of file objects)
        reader = new FileReader(); // instantiate a FileReader object to read its contents into memory

    // capture the file information.
    reader.onload = function (event) {
      imageObject = new Image();

      // clear canvas in case another image exists
      context.clearRect ( 0 , 0, canvas.width, canvas.height );

      // load image from data url
      imageObject.onload = function() {
        context.drawImage(imageObject, 0, 0, 620, 620);
      };

      imageObject.src = event.target.result;

    };

    reader.onerror = errorHandler;

    // read in the image file as a data URL.
    reader.readAsDataURL(file);

    button.classList.remove('disabled');
  }

  function errorHandler() {
    shell.querySelector('header').insertAdjacentHTML('afterend', '<p class="error">It looks like there was an issue with the file. You can either retry or select another one to upload.</p>');
  }

  function applyFilter() {
    var brightness,
        imageData = context.getImageData(0, 0, canvas.width, canvas.height), // retrieve image data
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
    context.putImageData(imageData, 0, 0);

    var j;
    context.globalAlpha = 0.5;

    // loop for each blur pass.
    for (j = -1; j < 2; j += 1) {
      context.drawImage(canvas, j, 0);
    }

    // reset alpha
    context.globalAlpha = 1.0;

    applyVignette();
  }

  function applyVignette() {
    // from vintageJS, by Robert Fleischmann - https://github.com/rendro/vintageJS/blob/master/src/vintage.js
    var gradient, outerRadius = Math.sqrt( Math.pow(canvas.width/2, 2) + Math.pow(canvas.height/2, 2) );

    gradient = context.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, outerRadius);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.65, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,14)'); // black value
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    gradient = context.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, outerRadius);
    gradient.addColorStop(0, 'rgba(255,255,255,0.2)'); // white value
    gradient.addColorStop(0.65, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // swap button
    button.removeEventListener('click', applyFilter);
    button.innerHTML = 'Save Image';
    button.addEventListener('click', saveAsPNG, true);
  }

  function saveAsPNG(event) {
    event.preventDefault();
    // from Canvas2Image, by Hongru Chenhr - https://github.com/hongru/canvas2image
    // save canvas image as data url (encodes as base64 encoded PNG file)
    strData = canvas.toDataURL('image/png');
    strDownloadMime = 'image/octet-stream';
    saveFile( strData.replace('image/png', strDownloadMime) );
  }

  function saveFile(strData) {
    document.location.href = strData;
  }

  return {
    init:init
  };

}());

/* end */


/* group Initializer */

THP.Initializer = {

  init: function() {
    this.isCompatible();
  },

  detectCanvasSupport: function() {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
  },

  detectDragAndDropSupport: function() {
    var div = document.createElement('div');
    return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
  },

  detectFileReaderSupport: function() {
    return !!(window.File && window.FileReader);
  },

  isCompatible: function() {
    if ( this.detectCanvasSupport() && this.detectDragAndDropSupport() && this.detectFileReaderSupport() ) {
      THP.App.init();
    } else {
      document.querySelector('h2').innerHTML = 'It looks like your browser doesn\'t support the features this site needs to work. Download the latest versions of <a href="https://www.google.com/chrome" target="_blank">Google Chrome</a> or <a href="http://www.mozilla.org/firefox/" target="_blank">Mozilla Firefox</a> in order to view it.';
    }
  }

};

/* end */

THP.Initializer.init();