/**
 * @author Jon Chretien
 * @overview saves file to computer
 * @copyright (c)2013 Jon Chretien
 */

define(function() {

  'use strict';

  var FileSaver = {

    /**
     * Saves canvas image as data URL.
     * Encodes as base64 encoded PNG file.
     * from Canvas2Image, by Hongru Chenhr - https://github.com/hongru/canvas2image
     *
     * @param {Object} event - The event triggered.
     */
    saveAsPNG: function(event) {
      event.preventDefault();
      FileSaver.saveFile( document.querySelector('canvas').toDataURL('image/png').replace('image/png', 'image/octet-stream') );
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

  return FileSaver;

});
