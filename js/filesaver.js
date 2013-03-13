/**
 * @author Jon Chretien
 * @version 2.0.1
 * @overview saves file to computer
 * @copyright (c)2013 Jon Chretien
 */

(function( window, document, undefined ) {

  'use strict';

  THP.FileSaver = {

    saveAsPNG: function(event) {
      event.preventDefault();
      // from Canvas2Image, by Hongru Chenhr - https://github.com/hongru/canvas2image
      // save canvas image as data url (encodes as base64 encoded PNG file)
      THP.FileSaver.saveFile( THP.InterfaceBuilder.canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream') );
    },

    saveFile: function(strData) {
      document.location.href = strData;
    }

  };

})( window, document );
