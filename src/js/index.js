import { initialState } from './state/machine';
import storeManager from './state/transition';
import {
  BROWSER_SUPPORT_SUCCESS,
  BROWSER_SUPPORT_FAILURE,
} from './state/actions';
import {
  hasCanvasSupport,
  hasDragAndDropSupport,
  hasFileReaderSupport,
  isTouchDevice,
} from './lib/support';
import Heading from './components/heading';
import App from './App';

function checkBrowserSupport() {
  const app = App();
  const heading = Heading();

  if (hasCanvasSupport() && hasDragAndDropSupport() && hasFileReaderSupport()) {
    storeManager.setState(initialState, BROWSER_SUPPORT_SUCCESS);
    app.render(heading);
    return;
  }

  storeManager.setState(initialState, BROWSER_SUPPORT_FAILURE);

  if (isTouchDevice()) {
    heading.update('touchDevice');
    return;
  }

  heading.update('upgradeBrowser');
}

checkBrowserSupport();
