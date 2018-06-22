import Heading from './components/heading';
import App from './App';
import {
  hasCanvasSupport,
  hasDragAndDropSupport,
  hasFileReaderSupport,
  isTouchDevice,
} from './lib/support';

const heading = Heading();

function checkBrowserSupport() {
  if (hasCanvasSupport() && hasDragAndDropSupport() && hasFileReaderSupport()) {
    App(heading);
    return;
  }

  if (isTouchDevice()) {
    heading.update('touchDevice');
    return;
  }

  heading.update('upgradeBrowser');
}

checkBrowserSupport();
