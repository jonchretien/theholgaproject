import Canvas from './components/canvas';
import Buttons from './components/buttons';

const App = () => {
  return {
    render(heading) {
      const canvas = Canvas();
      const buttons = Buttons();
      heading.update('instructions');
      canvas.init(heading);
      buttons.init(canvas.elements);
    },
  };
};

export default App;
