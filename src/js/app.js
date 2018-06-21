import updateHeadingText from './components/heading';
import Canvas from './components/canvas';
import Buttons from './components/buttons';

function App() {
  updateHeadingText('instructions');
  Canvas.init();
  Buttons.init(Canvas.getElements());
}

export default App;
