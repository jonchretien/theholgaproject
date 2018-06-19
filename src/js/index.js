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
    return;
  }

  if (isTouchDevice()) {
    console.log('is touch device');
    return;
  }

  console.log('no support');
}

checkBrowserSupport();
