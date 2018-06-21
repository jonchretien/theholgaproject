import updateHeadingText from './components/heading';
import renderCanvas from './components/canvas';
import Buttons from './components/buttons';

function App() {
  updateHeadingText('instructions');
  renderCanvas();
  Buttons.init();
}

export default App;
