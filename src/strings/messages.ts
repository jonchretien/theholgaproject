/**
 * UI Message Strings
 *
 * Centralized location for all user-facing messages.
 * Makes it easy to update copy and potentially add i18n in the future.
 */

/**
 * Message keys for different UI states
 */
export type MessageKey =
  | 'error'
  | 'touchDevice'
  | 'instructions'
  | 'upgradeBrowser';

/**
 * Message strings mapped by key
 */
const messages: Record<MessageKey, string> = {
  error:
    'It looks like there was an issue with the file. You can either retry or select another one to upload.',
  touchDevice:
    'It looks like you&rsquo;re on a touch device. This site currently works on desktop browsers only.',
  instructions: 'Drag a photo from your desktop into the box below',
  upgradeBrowser:
    'It looks like your browser doesn&rsquo;t support the features this site needs to work. Please consider upgrading to the latest version of <a href="https://www.google.com/chrome" target="_blank" rel="noopener noreferrer">Google Chrome</a>, <a href="http://www.mozilla.org/firefox/" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a>, or <a href="https://www.microsoft.com/en-us/windows/microsoft-edge" target="_blank" rel="noopener noreferrer">Microsoft Edge</a> in order to view it.',
};

/**
 * Gets a message string by key
 *
 * @param key - The message key
 * @returns The message string, or the key itself if not found
 *
 * @example
 * ```typescript
 * const msg = getMessage('instructions');
 * console.log(msg); // "Drag a photo from your desktop..."
 * ```
 */
export function getMessage(key: MessageKey | string): string {
  return Object.prototype.hasOwnProperty.call(messages, key)
    ? messages[key as MessageKey]
    : key;
}

export default getMessage;
