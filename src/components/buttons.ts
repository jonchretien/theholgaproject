/**
 * Buttons component for managing button interactions
 */

import { $$ } from "@/utils/dom";
import {
  ADD_BUTTON_EVENTS,
  REMOVE_BUTTON_EVENTS,
  type Action,
} from "@/state/constants";
import type PubSub from "@/state/pubsub";

/**
 * Buttons component interface
 */
export interface ButtonsComponent {
  init: () => void;
  cleanup: () => void;
}

/**
 * Creates a Buttons component
 *
 * Manages all button elements, enabling/disabling them and publishing
 * their actions to the PubSub system.
 *
 * @param pubsub - PubSub instance for event communication
 * @returns Buttons component instance
 *
 * @example
 * ```typescript
 * const pubsub = new PubSub();
 * const buttons = Buttons(pubsub);
 * buttons.init();
 * // Later...
 * buttons.cleanup();
 * ```
 */
export default function Buttons(pubsub: PubSub): ButtonsComponent {
  const buttons = $$<HTMLButtonElement>("button");

  /**
   * Initializes the button event subscriptions
   */
  function init(): void {
    pubsub.subscribe(ADD_BUTTON_EVENTS, addEvents);
    pubsub.subscribe(REMOVE_BUTTON_EVENTS, removeEvents);
  }

  /**
   * Adds event listeners and enables buttons
   */
  function addEvents(): void {
    buttons.forEach((button) => {
      button.addEventListener("click", onClick);
      button.removeAttribute("disabled");
    });
  }

  /**
   * Removes event listeners and disables buttons
   */
  function removeEvents(): void {
    buttons.forEach((button) => {
      button.removeEventListener("click", onClick);
      button.setAttribute("disabled", "true");
    });
  }

  /**
   * Handles click events on buttons
   *
   * @param event - Click event
   */
  function onClick(event: MouseEvent): void {
    event.preventDefault();

    const target = event.currentTarget as HTMLButtonElement;
    const action = target.getAttribute("data-action");

    // If button has a data-action attribute, publish it
    if (action) {
      pubsub.publish<void>(action as Action);
    }
  }

  /**
   * Cleanup function to remove event listeners and subscriptions
   * Prevents memory leaks when component is destroyed
   */
  function cleanup(): void {
    // Remove DOM event listeners
    removeEvents();

    // Unsubscribe from PubSub
    pubsub.unsubscribe(ADD_BUTTON_EVENTS, addEvents);
    pubsub.unsubscribe(REMOVE_BUTTON_EVENTS, removeEvents);
  }

  return {
    init,
    cleanup,
  };
}
