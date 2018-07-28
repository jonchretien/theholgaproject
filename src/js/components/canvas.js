import { $ } from '../utils';
import storeManager from '../state/transition';
import PubSub from '../state/pubsub';
import {
  ADD_BUTTON_EVENTS,
  APPLY_BW_FILTER,
  CLEAR_CANVAS,
  IMAGE_UPLOAD,
  IMAGE_UPLOAD_SUCCESS,
  IMAGE_UPLOAD_FAILURE,
  REMOVE_BUTTON_EVENTS,
  SAVE_IMAGE,
} from '../state/constants';
import FX from '../lib/effects';

const Canvas = components => {
  const { heading, buttons } = components;
  const shellElement = $('#shell');
  const canvasContainerElement = $('#canvas-container');

  const CANVAS_SIZE = 620;
  const HOVER_CLASS = 'hover';
  const ERROR_CLASS = 'error';

  let canvasElement = null;
  let contextObject = null;
  let currentState = null;

  function init() {
    currentState = storeManager.getState();
    createCanvasElement();
    bindEventHandlers();
    PubSub.subscribe(APPLY_BW_FILTER, applyBlackWhiteFX);
    PubSub.subscribe(CLEAR_CANVAS, clearCanvas);
    PubSub.subscribe(SAVE_IMAGE, saveImage);
  }

  function update(state, action) {
    storeManager.setState(state, action);
    currentState = storeManager.getState();
  }

  function createCanvasElement() {
    const cnvs = document.createElement('canvas');
    cnvs.setAttribute('width', CANVAS_SIZE);
    cnvs.setAttribute('height', CANVAS_SIZE);
    canvasContainerElement.appendChild(cnvs);
    canvasElement = $('canvas');
    contextObject = canvasElement.getContext('2d');
  }

  function bindEventHandlers() {
    canvasElement.addEventListener('dragover', addHoverClass, false);
    canvasElement.addEventListener('dragend', removeHoverClass, false);
    document.documentElement.addEventListener('drop', dropElement, true);
  }

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
    update(currentState, IMAGE_UPLOAD);
    canvasElement.classList.remove(HOVER_CLASS);

    getErrorMessage();

    // filelist (an array-like sequence of file objects)
    const file = event.dataTransfer.files[0];

    // instantiate a FileReader object to read its contents into memory
    const reader = new FileReader();

    // capture the file information.
    reader.onload = event => {
      const imageObject = new Image();

      // clear canvas in case another image exists
      contextObject.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // load image from data url
      imageObject.onload = () => {
        contextObject.drawImage(imageObject, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      };

      imageObject.src = event.target.result;
    };

    reader.onerror = setErrorMessage;

    // read in the image file as a data URL.
    reader.readAsDataURL(file);

    update(currentState, IMAGE_UPLOAD_SUCCESS);
    PubSub.publish(ADD_BUTTON_EVENTS);
  }

  /**
   * Checks for error message and removes if it exists.
   */
  function getErrorMessage() {
    if (currentState === 'error') {
      shellElement.removeChild(shellElement.querySelector(`.${ERROR_CLASS}`));
    }
  }

  /**
   * Inserts error message into DOM.
   */
  function setErrorMessage() {
    heading.update('error');
    update(currentState, IMAGE_UPLOAD_FAILURE);
  }

  /**
   * Applies the black and white photo effects.
   */
  function applyBlackWhiteFX() {
    FX.applyGrayscaleFilter(canvasElement, contextObject);
    FX.applyBlur(canvasElement, contextObject);
    FX.applyVignette(canvasElement, contextObject);
  }

  /**
   * Saves canvas image as data URL.
   * Encodes as base64 encoded PNG file.
   * from Canvas2Image, by Hongru Chenhr - https://github.com/hongru/canvas2image
   */
  function saveImage() {
    // base64 encoded PNG file.
    const imageData = canvasElement
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');

    // saves the file to the user's download folder.
    document.location.href = imageData;
  }

  function clearCanvas() {
    contextObject.clearRect(0, 0, canvasElement.width, canvasElement.height);
    PubSub.publish(REMOVE_BUTTON_EVENTS);
  }

  return {
    init,
  };
};

export default Canvas;
