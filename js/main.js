import PubSub from './state/pubsub';
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

function initialize() {
  const pubsub = new PubSub();
  const heading = Heading();

  // check for browser support
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

  // intialize application
  storeManager.setState(initialState, BROWSER_SUPPORT_SUCCESS);
  heading.update('instructions');
  const buttons = Buttons(pubsub);
  const canvas = Canvas(pubsub, heading);
  canvas.init();
}

initialize();
