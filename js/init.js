/**
 * @author Jon Chretien
 * @version 2.0.7
 * @overview detects canvas, drag and drop api, file reader api, and file list api support
 * @copyright (c)2013 Jon Chretien
 */

(function( window, document, undefined ) {

  'use strict';

  THP.Initializer = {

    /**
     * Contains defaults for DOM ids.
     */
    defaults: {
      heading: 'js-instructions'
    },

    /**
     * Sets up Initializer.
     */
    init: function() {
      // cache DOM elements
      this.heading = document.getElementById(this.defaults.heading);

      this.isCompatible();
    },

    /**
     * Detects touch device support.
     */
    detectTouchDevices: function() {
      return !!('ontouchstart' in window) || !!('onmsgesturechange' in window);
    },

    /**
     * Detects canvas support.
     */
    detectCanvasSupport: function() {
      var elem = document.createElement('canvas');
      return !!(elem.getContext && elem.getContext('2d'));
    },

    /**
     * Detects drag and drop support.
     */
    detectDragAndDropSupport: function() {
      var div = document.createElement('div');
      return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    },

    /**
     * Detects file reader support.
     */
    detectFileReaderSupport: function() {
      return !!(window.File && window.FileReader);
    },

    /**
     * Runs support tests to determine if app will work with the user's browser.
     * Displays alerts if browser doesn't meet requirements.
     */
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

})( window, document );
