/**
 * Application action constants
 *
 * These constants define all possible actions that can trigger state transitions
 * in the application's finite state machine.
 */

/**
 * Browser support check actions
 */
export const BROWSER_SUPPORT_SUCCESS = 'BROWSER_SUPPORT_SUCCESS' as const;
export const BROWSER_SUPPORT_FAILURE = 'BROWSER_SUPPORT_FAILURE' as const;

/**
 * Image upload actions
 */
export const IMAGE_UPLOAD = 'IMAGE_UPLOAD' as const;
export const IMAGE_UPLOAD_SUCCESS = 'IMAGE_UPLOAD_SUCCESS' as const;
export const IMAGE_UPLOAD_FAILURE = 'IMAGE_UPLOAD_FAILURE' as const;

/**
 * Filter effect actions
 */
export const APPLY_BW_FILTER = 'APPLY_BW_FILTER' as const;
export const APPLY_COLOR_FILTER = 'APPLY_COLOR_FILTER' as const;
export const REMOVE_FILTER = 'REMOVE_FILTER' as const;

/**
 * Canvas and image actions
 */
export const CLEAR_CANVAS = 'CLEAR_CANVAS' as const;
export const DOWNLOAD_IMAGE = 'DOWNLOAD_IMAGE' as const;
export const SAVE_IMAGE = 'SAVE_IMAGE' as const;

/**
 * Button event actions
 */
export const ADD_BUTTON_EVENTS = 'ADD_BUTTON_EVENTS' as const;
export const REMOVE_BUTTON_EVENTS = 'REMOVE_BUTTON_EVENTS' as const;

/**
 * Error recovery actions
 */
export const RETRY_UPLOAD = 'RETRY_UPLOAD' as const;
export const RESET_APP = 'RESET_APP' as const;

/**
 * Union type of all action constants
 * Useful for type checking and ensuring exhaustive switch statements
 */
export type Action =
  | typeof BROWSER_SUPPORT_SUCCESS
  | typeof BROWSER_SUPPORT_FAILURE
  | typeof IMAGE_UPLOAD
  | typeof IMAGE_UPLOAD_SUCCESS
  | typeof IMAGE_UPLOAD_FAILURE
  | typeof APPLY_BW_FILTER
  | typeof APPLY_COLOR_FILTER
  | typeof REMOVE_FILTER
  | typeof CLEAR_CANVAS
  | typeof DOWNLOAD_IMAGE
  | typeof SAVE_IMAGE
  | typeof ADD_BUTTON_EVENTS
  | typeof REMOVE_BUTTON_EVENTS
  | typeof RETRY_UPLOAD
  | typeof RESET_APP;

/**
 * Object containing all actions for convenient iteration/validation
 */
export const ACTIONS = {
  BROWSER_SUPPORT_SUCCESS,
  BROWSER_SUPPORT_FAILURE,
  IMAGE_UPLOAD,
  IMAGE_UPLOAD_SUCCESS,
  IMAGE_UPLOAD_FAILURE,
  APPLY_BW_FILTER,
  APPLY_COLOR_FILTER,
  REMOVE_FILTER,
  CLEAR_CANVAS,
  DOWNLOAD_IMAGE,
  SAVE_IMAGE,
  ADD_BUTTON_EVENTS,
  REMOVE_BUTTON_EVENTS,
  RETRY_UPLOAD,
  RESET_APP,
} as const;
