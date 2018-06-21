import FX from '../lib/effects';

const filterBtn = document.getElementById('btn-filter-bw');
const saveBtn = document.getElementById('btn-save');

function init() {
  [filterBtn, saveBtn].forEach(el => el.removeAttribute('disabled'));
  bindEventHandlers();
}

/**
 * Adds event handlers.
 */
function bindEventHandlers() {
  filterBtn.addEventListener('click', applyEffects, false);
  saveBtn.addEventListener('click', saveAsPNG, false);
}

/**
 * Removes event handlers.
 */
function removeEventHandlers() {
  filterBtn.removeEventListener('click', applyEffects, false);
  saveBtn.removeEventListener('click', saveAsPNG, false);
}

/**
 * Applies all of the photo effects.
 *
 * @param {Object} event - The event triggered.
 */
function applyEffects(event) {
  event.preventDefault();
  removeEventHandlers();
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
    canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
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
