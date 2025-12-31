/**
 * Heading component for displaying instructions and messages
 */

import { $ } from '@/utils/dom';
import getMessage, { type MessageKey } from '@/strings/messages';

/**
 * Heading component interface
 */
export interface HeadingComponent {
  update: (message: MessageKey | string) => void;
}

/**
 * Creates a Heading component
 *
 * Manages the heading element that displays instructions and status messages.
 *
 * @returns Heading component instance
 *
 * @example
 * ```typescript
 * const heading = Heading();
 * heading.update('instructions');
 * heading.update('error');
 * ```
 */
export default function Heading(): HeadingComponent {
  const headingElement = $<HTMLElement>('#instructions');

  /**
   * Updates the heading with a new message
   *
   * @param message - Message key or custom message string
   */
  function update(message: MessageKey | string): void {
    if (!headingElement) {
      console.warn('Heading element not found');
      return;
    }

    headingElement.innerHTML = getMessage(message);
  }

  return {
    update,
  };
}
