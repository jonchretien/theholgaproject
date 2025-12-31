/**
 * Application entry point
 *
 * Initializes the application, checks for browser support,
 * and sets up all components.
 */

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

/**
 * Initializes the application
 */
function initialize(): void {
  const heading = Heading();

  // Check for browser support
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

  // Set the state to indicate browser support is successful
  storeManager.setState(initialState, BROWSER_SUPPORT_SUCCESS);
  heading.update('instructions');

  // Initialize components with dependency injection
  const pubsub = new PubSub();
  const buttons = Buttons(pubsub);
  const canvas = PhotoCanvas(pubsub, heading, storeManager);

  buttons.init();
  canvas.init();
}

// Start the application
initialize();
