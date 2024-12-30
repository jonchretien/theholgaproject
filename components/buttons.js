import { $$ } from '../utils';
import {
  ADD_BUTTON_EVENTS,
  APPLY_BW_FILTER,
  APPLY_COLOR_FILTER,
  CLEAR_CANVAS,
  REMOVE_BUTTON_EVENTS,
  SAVE_IMAGE,
} from '../state/constants';
import PubSub from '../state/pubsub';

const Buttons = () => {
  const buttons = $$('button');

  PubSub.subscribe(ADD_BUTTON_EVENTS, addEvents);
  PubSub.subscribe(REMOVE_BUTTON_EVENTS, removeEvents);

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
   * Removes event listeners.
   */
  function removeEvents() {
    buttons.forEach(button => {
      button.removeEventListener('click', onClick);
      button.setAttribute('disabled', true);
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
        PubSub.publish(APPLY_BW_FILTER);
        break;
      }
      case APPLY_COLOR_FILTER: {
        PubSub.publish(APPLY_COLOR_FILTER);
        break;
      }
      case CLEAR_CANVAS: {
        PubSub.publish(CLEAR_CANVAS);
        break;
      }
      case SAVE_IMAGE: {
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
