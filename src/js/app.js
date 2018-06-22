import Canvas from './components/canvas';
import Buttons from './components/buttons';

const canvas = Canvas();
const buttons = Buttons();

function App(heading) {
  heading.update('instructions');
  canvas.init(heading);
  buttons.init(canvas.elements);
}

export default App;
