import Canvas from './components/canvas';
import Buttons from './components/buttons';

const App = () => {
  return {
    render(heading) {
      const buttons = Buttons();
      const canvas = Canvas({ heading, buttons });
      heading.update('instructions');
      canvas.init();
    },
  };
};

export default App;
