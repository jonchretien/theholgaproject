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
import Buttons from './components/buttons';
import Heading from './components/heading';
import PhotoCanvas from './components/canvas';

function initialize() {
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

  // set the state to indicate browser support is successful and update heading with instructions
  storeManager.setState(initialState, BROWSER_SUPPORT_SUCCESS);
  heading.update('instructions');

  // initialize buttons and photo canvas components
  const pubsub = new PubSub();
  const buttons = Buttons(pubsub);
  const canvas = PhotoCanvas(pubsub, heading);
  buttons.init();
  canvas.init();
}

initialize();
