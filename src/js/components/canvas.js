import messages from '../strings/messages';

const instructions = document.getElementById('instructions');
const shell = document.getElementById('shell');
const canvasContainer = document.getElementById('canvas-container');
const btn = document.getElementById('btn-holgafy');

let canvas = null;
let context = null;

const renderCanvas = () => {
  instructions.textContent = messages.instructions;
  var cnvs = document.createElement('canvas');
  cnvs.setAttribute('class', 'canvas');
  canvasContainer.appendChild(cnvs);
  canvas = document.querySelector('canvas');
  context = canvas.getContext('2d');
};

export default renderCanvas;
