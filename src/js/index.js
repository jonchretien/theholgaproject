import { initialState } from './state/machine';
import storeManager from './state/transition';
import {
  BROWSER_SUPPORT_SUCCESS,
  BROWSER_SUPPORT_FAILURE,
} from './state/constants';
import {
  hasCanvasSupport,
  hasDragAndDropSupport,
  hasFileReaderSupport,
  isTouchDevice,
} from './lib/support';
import Canvas from './components/canvas';
import Buttons from './components/buttons';
import Heading from './components/heading';

function checkBrowserSupport() {
  const heading = Heading();

  if (
    !hasCanvasSupport() || !hasDragAndDropSupport() || !hasFileReaderSupport()
  ) {
    storeManager.setState(initialState, BROWSER_SUPPORT_FAILURE);
    heading.update('upgradeBrowser');
    return;
  }

  if (isTouchDevice()) {
    storeManager.setState(initialState, BROWSER_SUPPORT_FAILURE);
    heading.update('touchDevice');
    return;
  }

  storeManager.setState(initialState, BROWSER_SUPPORT_SUCCESS);
  heading.update('instructions');
  const buttons = Buttons();
  const canvas = Canvas({ heading, buttons });
  canvas.init();
}

checkBrowserSupport();
