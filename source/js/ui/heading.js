define(function() {

  'use strict';

  /**
   * Updates heading text with either support or instruction messages
   */
  var Heading = {

    /**
     * Contains defaults for DOM id and heading text.
     */
    defaults: {
      heading: 'js-instructions',
      text: {
        touch:        'It looks like you&rsquo;re on a touch device. This site currently works on desktop browsers only.',
        instructions: 'Drag a photo from your desktop into the box below',
        support:      'It looks like your browser doesn&rsquo;t support the features this site needs to work. ' +
                      'Download the latest versions of <a href="https://www.google.com/chrome" target="_blank">Google Chrome</a> or ' +
                      '<a href="http://www.mozilla.org/firefox/" target="_blank">Mozilla Firefox</a> in order to view it.'
      }
    },

    /**
     * Updates heading text.
     *
     * @param {String} message - key for text object.
     */
    render: function(message) {
      document.getElementById(this.defaults.heading).innerHTML = this.defaults.text[message];
    }

  };

  return Heading;

});
