import FX from '../lib/effects';

const filterBtnElement = document.getElementById('btn-filter-bw');
const saveBtnElement = document.getElementById('btn-save');

let canvasElement;
let contextObject;

function init(elements) {
  canvasElement = elements.canvasElement;
  contextObject = elements.contextObject;
  [filterBtnElement, saveBtnElement].forEach(el =>
    el.removeAttribute('disabled')
  );
  bindEventHandlers();
}

/**
 * Adds event handlers.
 */
function bindEventHandlers() {
  filterBtnElement.addEventListener('click', applyEffects, false);
  saveBtnElement.addEventListener('click', saveAsPNG, false);
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

/**
 * Saves the file to the user's download folder.
 *
 * @param {String} strData - base64 encoded PNG file.
 */
function saveFile(strData) {
  document.location.href = strData;
}

const Buttons = {
  init,
};

export default Buttons;
