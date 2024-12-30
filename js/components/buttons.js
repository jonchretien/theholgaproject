import { $$ } from '../utils';
import {
  ADD_BUTTON_EVENTS,
  APPLY_BW_FILTER,
  APPLY_COLOR_FILTER,
  CLEAR_CANVAS,
  REMOVE_BUTTON_EVENTS,
  SAVE_IMAGE,
} from '../state/constants';

export default function Buttons(pubsub) {
  const buttons = $$('button');

  pubsub.subscribe(ADD_BUTTON_EVENTS, addEvents);
  pubsub.subscribe(REMOVE_BUTTON_EVENTS, removeEvents);

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
        pubsub.publish(APPLY_BW_FILTER);
        break;
      }
      case APPLY_COLOR_FILTER: {
        pubsub.publish(APPLY_COLOR_FILTER);
        break;
      }
      case CLEAR_CANVAS: {
        pubsub.publish(CLEAR_CANVAS);
        break;
      }
      case SAVE_IMAGE: {
        pubsub.publish(SAVE_IMAGE);
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
