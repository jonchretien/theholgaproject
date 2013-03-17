/**
 * @author Jon Chretien
 * @version 2.0.7
 * @overview saves file to computer
 * @copyright (c)2013 Jon Chretien
 */

(function( window, document, undefined ) {

  'use strict';

  THP.FileSaver = {

    /**
     * Saves canvas image as data URL.
     * Encodes as base64 encoded PNG file.
     * from Canvas2Image, by Hongru Chenhr - https://github.com/hongru/canvas2image
     *
     * @param {Object} event - The event triggered.
     */
    saveAsPNG: function(event) {
      event.preventDefault();
      THP.FileSaver.saveFile( THP.InterfaceBuilder.canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream') );
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

})( window, document );
