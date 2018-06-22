import Canvas from './components/canvas';
import Buttons from './components/buttons';

const canvas = Canvas();

function App(heading) {
  heading.update('instructions');
  canvas.init(heading);
  Buttons.init(canvas.elements);
}

export default App;
