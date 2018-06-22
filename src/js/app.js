import Canvas from './components/canvas';
import Buttons from './components/buttons';

function App(heading) {
  heading.update('instructions');
  Canvas.init(heading);
  Buttons.init(Canvas.getElements());
}

export default App;
