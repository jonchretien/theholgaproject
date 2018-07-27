import { $$ } from '../utils';
import { APPLY_BW_FILTER, CLEAR_CANVAS, SAVE_IMAGE } from '../state/constants';
import PubSub from '../state/pubsub';

const Buttons = () => {
  const buttons = $$('button');

  /**
   * Adds event listeners.
   */
  function addEvents() {
    buttons.forEach(button => {
      button.addEventListener('click', onClick);
      button.removeAttribute('disabled');
    });
  }

  /**
   * Removes event handlers.
   */
  function removeEvents() {
    buttons.forEach(button => {
      button.removeEventListener('click', onClick);
      button.setAttribute('disabled');
    });
  }

  /**
   * Handle click events.
   *
   * @param {Object} event - The event triggered.
   */
  function onClick(event) {
    event.preventDefault();
    const getAction = event.currentTarget.getAttribute('data-action');
    switch (getAction) {
      case APPLY_BW_FILTER: {
        console.log('filter');
        PubSub.publish(APPLY_BW_FILTER);
        break;
      }
      case CLEAR_CANVAS: {
        console.log('clear');
        PubSub.publish(CLEAR_CANVAS);
        break;
      }
      case SAVE_IMAGE: {
        console.log('save');
        PubSub.publish(SAVE_IMAGE);
        break;
      }
      default: {
        break;
      }
    }
  }

  return {
    addEvents,
    removeEvents,
  };
};

export default Buttons;
