/**
 * @author Jon Chretien
 * @version 2.0.1
 * @overview detects canvas, drag and drop api, file reader api, and file list api support
 * @copyright (c)2013 Jon Chretien
 */

(function( window, document, THP, undefined ) {

  'use strict';

  THP.Initializer = {

    heading: 'js-instructions',

    init: function() {
      this.heading = document.getElementById(this.heading);
      this.isCompatible();
    },

    detectTouchDevices: function() {
      return !!('ontouchstart' in window) || !!('onmsgesturechange' in window);
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
      if ( this.detectCanvasSupport() && this.detectDragAndDropSupport() && this.detectFileReaderSupport() && !this.detectTouchDevices() ) {
        THP.InterfaceBuilder.init();
      } else if ( this.detectTouchDevices() ) {
        this.heading.innerHTML = 'It looks like you\'re on a touch device. This site currently works on desktop browsers only.';
      } else {
        this.heading.innerHTML = 'It looks like your browser doesn\'t support the features this site needs to work. Download the latest versions of <a href="https://www.google.com/chrome" target="_blank">Google Chrome</a> or <a href="http://www.mozilla.org/firefox/" target="_blank">Mozilla Firefox</a> in order to view it.';
      }
    }

  };

  THP.Initializer.init();

})( window, document, window.THP );