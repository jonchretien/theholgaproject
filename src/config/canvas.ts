/**
 * Canvas configuration constants
 */

/**
 * Canvas dimensions
 * 820px square format to match classic Holga 120 film square format
 */
export const CANVAS_SIZE = 820;

/**
 * CSS class names for canvas states
 */
export const CANVAS_CLASSES = {
  hover: 'canvas--hover',
} as const;

/**
 * File upload validation constraints
 */
export const FILE_CONSTRAINTS = {
  /**
   * Maximum file size in bytes (10MB)
   */
  maxSize: 10 * 1024 * 1024,

  /**
   * Allowed image MIME types
   */
  allowedTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ] as const,

  /**
   * Allowed file extensions
   */
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const,
} as const;

/**
 * Error messages for file validation
 */
export const FILE_ERROR_MESSAGES = {
  noFile: 'No file was provided',
  tooLarge: `File is too large. Maximum size is ${FILE_CONSTRAINTS.maxSize / (1024 * 1024)}MB`,
  invalidType: `Invalid file type. Allowed types: ${FILE_CONSTRAINTS.allowedTypes.join(', ')}`,
  readError: 'Error reading file. Please try again.',
} as const;
