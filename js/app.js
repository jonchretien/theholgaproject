define(['heading', 'buttons', 'canvas'], function(Heading, Buttons, Canvas) {

  'use strict';

  /**
   * Detects canvas, drag and drop api, file reader api, and file list api support.
   */
  var App = {

    /**
     * Sets up Initializer.
     */
    init: function() {
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
        // cache DOM elements
        var footer = document.getElementById('js-siteFooter');
        var shell = document.getElementById('js-shell');

        // trigger app logic
        Canvas.init(footer, shell);
        Buttons.init(footer, shell);
      } else if ( this.detectTouchDevices() ) {
        Heading.render('touch');
      } else {
        Heading.render('support');
      }
    }

  };

  return App;

});
