import updateHeadingText from './components/heading';
import App from './App';
import {
  hasCanvasSupport,
  hasDragAndDropSupport,
  hasFileReaderSupport,
  isTouchDevice,
} from './lib/support';

function checkBrowserSupport() {
  if (hasCanvasSupport() && hasDragAndDropSupport() && hasFileReaderSupport()) {
    App();
    return;
  }

  if (isTouchDevice()) {
    updateHeadingText('touchDevice');
    return;
  }

  updateHeadingText('upgradeBrowser');
}

checkBrowserSupport();
