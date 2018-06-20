import getMessage from '../strings/messages';

// const instructions = document.getElementById('instructions');
const shell = document.getElementById('shell');
const canvasContainer = document.getElementById('canvas-container');
const btn = document.getElementById('btn-holgafy');
const HOVER_CLASS = 'hover';

let canvasEl = null;
let cnvs = null;
let context = null;

function init() {
  // instructions.textContent = getMessage(instructions);
  createCanvasElement();
  insertCanvasElement();
  // bindEventHandlers();
}

function createCanvasElement() {
  cnvs = document.createElement('canvas');
  cnvs.setAttribute('class', 'canvas');
}

function insertCanvasElement() {
  canvasContainer.appendChild(cnvs);
  canvasEl = document.querySelector('canvas');
  context = canvasEl.getContext('2d');
}

function bindEventHandlers() {
  canvasEl.addEventListener('dragover', addHoverClass, false);
  canvasEl.addEventListener('dragend', removeHoverClass, false);
  document.documentElement.addEventListener(
    'drop',
    dropElement.bind(this),
    true
  );
}

function removeEventHandlers() {
  canvasEl.removeEventListener('dragover', addHoverClass, false);
  canvasEl.removeEventListener('dragend', removeHoverClass, false);
  document.documentElement.removeEventListener('drop', dropElement, true);
}

/**
   * Adds hover class to canvas.
   *
   * @param {Object} event - The event triggered.
   */
function addHoverClass(event) {
  event.preventDefault();
  event.target.classList.add(HOVER_CLASS);
}

/**
   * Removes hover class from canvas.
   *
   * @param {Object} event - The event triggered.
   */
function removeHoverClass(event) {
  event.preventDefault();
  event.target.classList.remove(HOVER_CLASS);
}

/**
   * Drops image onto canvas.
   *
   * @param {Object} event - The event triggered.
   */
function dropElement(event) {
  event.preventDefault();
  canvasEl.classList.remove('hover');

  // check for error message and remove if it exists
  if (shell.querySelector('.error')) {
    shell.removeChild(shell.querySelector('.error'));
  }

  var file = event.dataTransfer.files[0], // filelist (an array-like sequence of file objects)
    imageObject,
    reader = new FileReader(); // instantiate a FileReader object to read its contents into memory

  // save reference to 'this'
  // var self = this;

  // capture the file information.
  reader.onload = event => {
    imageObject = new Image();

    // clear canvas in case another image exists
    context.clearRect(0, 0, canvasEl.width, canvasEl.height);

    // load image from data url
    imageObject.onload = () => {
      context.drawImage(imageObject, 0, 0, 620, 620);
    };

    imageObject.src = event.target.result;
  };

  reader.onerror = errorHandler;

  // read in the image file as a data URL.
  reader.readAsDataURL(file);

  // this.button.classList.remove('disabled');
}

const canvas = {
  init,
};

export default canvas;
