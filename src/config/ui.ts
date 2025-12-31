/**
 * UI configuration constants
 */

/**
 * CSS class names used throughout the application
 */
export const UI_CLASSES = {
  error: 'banner--error',
  hover: 'canvas--hover',
} as const;

/**
 * Download file configuration
 */
export const DOWNLOAD_CONFIG = {
  /**
   * Default filename for downloaded images
   */
  filename: 'holga_image.png',

  /**
   * Image format for download
   */
  mimeType: 'image/png',
} as const;
