/**
 * Support helpers
 */

/**
  * Detects touch device support.
*/
export const isTouchDevice = () =>
  'ontouchstart' in window || !!window.navigator.maxTouchPoints;

/**
  * Detects canvas support.
*/
export const hasCanvasSupport = () => {
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
};

/**
  * Detects drag and drop support.
*/
export const hasDragAndDropSupport = () => {
  var div = document.createElement('div');
  return 'draggable' in div || ('ondragstart' in div && 'ondrop' in div);
};

/**
  * Detects file reader support.
*/
export const hasFileReaderSupport = () => !!(window.File && window.FileReader);
