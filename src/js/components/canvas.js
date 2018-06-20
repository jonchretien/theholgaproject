import getMessage from '../strings/messages';
import updateHeadingText from './heading';

const shell = document.getElementById('shell');
const canvasContainer = document.getElementById('canvas-container');
const btn = document.getElementById('btn-holgafy');

const HOVER_CLASS = 'hover';
const ERROR_CLASS = 'error';

let canvasEl = null;
let cnvs = null;
let context = null;

function init() {
  updateHeadingText('instructions');
  createCanvasElement();
  bindEventHandlers();
}

function createCanvasElement() {
  cnvs = document.createElement('canvas');
  canvasContainer.appendChild(cnvs);
  canvasEl = document.querySelector('canvas');
  context = canvasEl.getContext('2d');
}

function bindEventHandlers() {
  canvasEl.addEventListener('dragover', addHoverClass, false);
  canvasEl.addEventListener('dragend', removeHoverClass, false);
  document.documentElement.addEventListener('drop', dropElement, true);
}

// function removeEventHandlers() {
//   canvasEl.removeEventListener('dragover', addHoverClass, false);
//   canvasEl.removeEventListener('dragend', removeHoverClass, false);
//   document.documentElement.removeEventListener('drop', dropElement, true);
// }

/**
   * @param {Object} event - The event triggered.
   */
function addHoverClass(event) {
  event.preventDefault();
  event.target.classList.add(HOVER_CLASS);
}

/**
   * @param {Object} event - The event triggered.
   */
function removeHoverClass(event) {
  event.preventDefault();
  event.target.classList.remove(HOVER_CLASS);
}

/**
   * @param {Object} event - The event triggered.
   */
function dropElement(event) {
  event.preventDefault();
  canvasEl.classList.remove(HOVER_CLASS);

  getErrorMessage();

  // filelist (an array-like sequence of file objects)
  const file = event.dataTransfer.files[0];

  // instantiate a FileReader object to read its contents into memory
  const reader = new FileReader();

  // save reference to 'this'
  // const self = this;

  // let imageObject = null;

  // capture the file information.
  reader.onload = event => {
    const imageObject = new Image();

    // clear canvas in case another image exists
    context.clearRect(0, 0, canvasEl.width, canvasEl.height);

    // load image from data url
    imageObject.onload = () => {
      context.drawImage(imageObject, 0, 0, 620, 620);
    };

    imageObject.src = event.target.result;
  };

  reader.onerror = setErrorMessage;

  // read in the image file as a data URL.
  reader.readAsDataURL(file);

  // activateButtons();
}

/**
 * Checks for error message and removes if it exists.
 */
function getErrorMessage() {
  if (shell.querySelector(`.${ERROR_CLASS}`)) {
    shell.removeChild(shell.querySelector(`.${ERROR_CLASS}`));
  }
}

/**
 * Inserts error message into DOM.
 */
function setErrorMessage() {
  heading.update(getMessage(error));
}

const canvas = {
  init,
};

export default canvas;
