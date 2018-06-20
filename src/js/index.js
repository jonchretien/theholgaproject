import getMessage from './strings/messages';
import heading from './components/heading';
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
    console.log('cuts the mustard');
    App();
    return;
  }

  if (isTouchDevice()) {
    console.log('is touch device');
    heading.update(getMessage(touchDevice));
    return;
  }

  heading.update(getMessage(upgradeBrowser));
  console.log('no support');
}

checkBrowserSupport();
