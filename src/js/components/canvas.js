const Canvas = () => {
  const shellElement = document.getElementById('shell');
  const canvasContainerElement = document.getElementById('canvas-container');

  const CANVAS_SIZE = 620;
  const HOVER_CLASS = 'hover';
  const ERROR_CLASS = 'error';

  let canvasElement = null;
  let contextObject = null;
  let heading = null;

  function init(heading) {
    heading = heading;
    createCanvasElement();
    bindEventHandlers();
  }

  function createCanvasElement() {
    const cnvs = document.createElement('canvas');
    cnvs.setAttribute('width', CANVAS_SIZE);
    cnvs.setAttribute('height', CANVAS_SIZE);
    canvasContainerElement.appendChild(cnvs);
    canvasElement = document.querySelector('canvas');
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

    // @todo add active state
    // activateButtons();
  }

  /**
   * Checks for error message and removes if it exists.
   */
  function getErrorMessage() {
    if (shellElement.querySelector(`.${ERROR_CLASS}`)) {
      shellElement.removeChild(shellElement.querySelector(`.${ERROR_CLASS}`));
    }
  }

  /**
   * Inserts error message into DOM.
   */
  function setErrorMessage() {
    heading.update('error');
  }

  return {
    init,
    get elements() {
      return {
        canvasElement,
        contextObject,
      };
    },
  };
};

export default Canvas;
