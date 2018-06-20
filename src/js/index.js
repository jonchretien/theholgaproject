import updateHeadingText from './components/heading';
import App from './App';
import {
  hasCanvasSupport,
  hasDragAndDropSupport,
  hasFileReaderSupport,
  isTouchDevice,
} from './lib/support';

/**
 * Runs support tests to determine if app will work with the user's browser.
 * Displays alerts if browser doesn't meet requirements.
 */
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
