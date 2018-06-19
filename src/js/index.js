import messages from './strings/messages';
import renderCanvas from './components/canvas';
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
  const heading = document.getElementById('instructions');

  if (hasCanvasSupport() && hasDragAndDropSupport() && hasFileReaderSupport()) {
    console.log('cuts the mustard');
    renderCanvas();
    return;
  }

  if (isTouchDevice()) {
    console.log('is touch device');
    heading.innerHTML = messages.touchDevice;
    return;
  }

  heading.innerHTML = messages.upgradeBrowser;
  console.log('no support');
}

checkBrowserSupport();
