import storeManager from '../state/transition';
import { $$ } from '../utils';
import { APPLY_BW_FILTER, CLEAR_PHOTO, SAVE_PHOTO } from '../state/actions';
import FX from '../lib/effects';

const Buttons = () => {
  const buttons = $$('button');

  /**
   * Adds event listeners.
   */
  function addEvents() {
    buttons.forEach(button => {
      button.addEventListener('click', onClick);
      button.removeAttribute('disabled');
    });
  }

  /**
   * Removes event handlers.
   */
  function removeEvents() {
    buttons.forEach(button => {
      button.removeEventListener('click', onClick);
      button.setAttribute('disabled');
    });
  }

  /**
   * Handle click events.
   */
  function onClick({ currentTarget }) {
    switch (currentTarget.getAttribute('data-action')) {
      case APPLY_BW_FILTER: {
        console.log('filter');
        applyBlackWhiteFX();
        break;
      }
      case CLEAR_PHOTO: {
        console.log('clear');
        clearCanvas();
        break;
      }
      case SAVE_PHOTO: {
        console.log('save');
        saveAsPNG();
        break;
      }
      default: {
        break;
      }
    }
  }

  /**
   * Applies the black and white photo effects.
   *
   * @param {Object} event - The event triggered.
   */
  function applyBlackWhiteFX(event) {
    event.preventDefault();
    FX.applyGrayscaleFilter();
    FX.applyBlur();
    FX.applyVignette();
  }

  /**
   * Saves canvas image as data URL.
   * Encodes as base64 encoded PNG file.
   * from Canvas2Image, by Hongru Chenhr - https://github.com/hongru/canvas2image
   *
   * @param {Object} event - The event triggered.
   */
  function saveAsPNG(event) {
    event.preventDefault();
    saveFile(
      canvasElement
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream')
    );
  }

  function clearCanvas(event) {
    event.preventDefault();
    console.log('clear canvas');
  }

  /**
   * Saves the file to the user's download folder.
   *
   * @param {String} strData - base64 encoded PNG file.
   */
  function saveFile(strData) {
    document.location.href = strData;
  }

  return {
    addEvents,
    removeEvents,
  };
};

export default Buttons;
