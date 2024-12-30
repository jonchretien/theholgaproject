/*
 * Message Strings
 */

const messages = {
  error: 'It looks like there was an issue with the file. You can either retry or select another one to upload.',
  touchDevice: 'It looks like you&rsquo;re on a touch device. This site currently works on desktop browsers only.',
  instructions: 'Drag a photo from your desktop into the box below',
  upgradeBrowser: 'It looks like your browser doesn&rsquo;t support the features this site needs to work. Please consider upgrading to the latest version of <a href="https://www.google.com/chrome" target="_blank" rel="noopener noreferrer">Google Chrome</a>, <a href="http://www.mozilla.org/firefox/" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a>, or <a href="https://www.microsoft.com/en-us/windows/microsoft-edge" target="_blank" rel="noopener noreferrer">Microsoft Edge</a> in order to view it.',
};

export const getMessage = msg =>
  (Object.hasOwnProperty.call(messages, msg) ? messages[msg] : msg);

export default getMessage;
