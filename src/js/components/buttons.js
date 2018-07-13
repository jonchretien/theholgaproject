import storeManager from '../state/transition';
import FX from '../lib/effects';

const Buttons = () => {
  const filterBtnElement = document.getElementById('btn-filter-bw');
  const saveBtnElement = document.getElementById('btn-save');
  const clearBtnElement = document.getElementById('btn-clear');

  let canvasElement;
  let contextObject;

  function init(elements) {
    canvasElement = elements.canvasElement;
    contextObject = elements.contextObject;
  }

  function enableButtons() {
    [filterBtnElement, saveBtnElement, clearBtnElement].forEach(el =>
      el.removeAttribute('disabled')
    );
  }

  /**
   * Adds event handlers.
   */
  function bindEventHandlers() {
    filterBtnElement.addEventListener('click', applyEffects, false);
    saveBtnElement.addEventListener('click', saveAsPNG, false);
    clearBtnElement.addEventListener('click', clearCanvas, false);
  }

  /**
   * Removes event handlers.
   */
  function removeEventHandlers() {
    filterBtnElement.removeEventListener('click', applyEffects, false);
    // saveBtnElement.removeEventListener('click', saveAsPNG, false);
  }

  /**
   * Applies all of the photo effects.
   *
   * @param {Object} event - The event triggered.
   */
  function applyEffects(event) {
    event.preventDefault();
    removeEventHandlers();
    FX.applyGrayscaleFilter(canvasElement, contextObject);
    FX.applyBlur(canvasElement, contextObject);
    FX.applyVignette(canvasElement, contextObject);
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
    init,
    enableButtons,
    bindEventHandlers,
  };
};

export default Buttons;
