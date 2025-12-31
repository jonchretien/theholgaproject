/**
 * Browser feature detection utilities
 *
 * Provides functions to detect support for various browser APIs
 * needed by the application.
 */

/**
 * Detects if the device supports touch events
 *
 * @returns True if touch is supported
 *
 * @example
 * ```typescript
 * if (isTouchDevice()) {
 *   console.log('Touch-enabled device detected');
 * }
 * ```
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    (window.navigator.maxTouchPoints !== undefined &&
      window.navigator.maxTouchPoints > 0)
  );
}

/**
 * Detects if the browser supports the Canvas API
 *
 * @returns True if Canvas is supported
 *
 * @example
 * ```typescript
 * if (!hasCanvasSupport()) {
 *   alert('Canvas is not supported');
 * }
 * ```
 */
export function hasCanvasSupport(): boolean {
  const canvas = document.createElement('canvas');
  return !!(canvas.getContext && canvas.getContext('2d'));
}

/**
 * Detects if the browser supports drag and drop
 *
 * @returns True if drag and drop is supported
 *
 * @example
 * ```typescript
 * if (!hasDragAndDropSupport()) {
 *   // Provide alternative upload method
 * }
 * ```
 */
export function hasDragAndDropSupport(): boolean {
  const div = document.createElement('div');
  return (
    'draggable' in div || ('ondragstart' in div && 'ondrop' in div)
  );
}

/**
 * Detects if the browser supports the FileReader API
 *
 * @returns True if FileReader is supported
 *
 * @example
 * ```typescript
 * if (!hasFileReaderSupport()) {
 *   alert('FileReader is not supported');
 * }
 * ```
 */
export function hasFileReaderSupport(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    window.File &&
    window.FileReader
  );
}

/**
 * Checks if all required features are supported
 *
 * @returns True if all required features are available
 *
 * @example
 * ```typescript
 * if (!hasRequiredFeatures()) {
 *   showBrowserUpgradeMessage();
 * }
 * ```
 */
export function hasRequiredFeatures(): boolean {
  return (
    hasCanvasSupport() &&
    hasDragAndDropSupport() &&
    hasFileReaderSupport()
  );
}

/**
 * Gets a list of missing features
 *
 * @returns Array of missing feature names
 *
 * @example
 * ```typescript
 * const missing = getMissingFeatures();
 * if (missing.length > 0) {
 *   console.log('Missing features:', missing.join(', '));
 * }
 * ```
 */
export function getMissingFeatures(): string[] {
  const missing: string[] = [];

  if (!hasCanvasSupport()) missing.push('Canvas API');
  if (!hasDragAndDropSupport()) missing.push('Drag and Drop API');
  if (!hasFileReaderSupport()) missing.push('FileReader API');

  return missing;
}
