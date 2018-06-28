import * as action from './actions';

/**
 * Finite state machine
 */
export const machine = {
  // the initial page view
  start: {
    [action.BROWSER_SUPPORT_SUCCESS]: 'idle',
    [action.BROWSER_SUPPORT_FAILURE]: 'error',
  },

  // app waits for user to upload image
  idle: {
    [action.IMAGE_UPLOAD]: 'upload',
  },

  // image is being uploaded to the canvas
  upload: {
    [action.IMAGE_UPLOAD_SUCCESS]: 'photo',
    [action.IMAGE_UPLOAD_FAILURE]: 'error',
  },

  // raw image has been added to the canvas
  photo: {
    [action.APPLY_BW_FILTER]: 'filtered',
  },

  // image has been filtered
  filtered: {
    [action.SAVE_PHOTO]: 'saved',
    [action.CLEAR_PHOTO]: 'cleared',
  },

  // image has been saved
  saved: {
    [action.SAVE_PHOTO]: 'saved',
    [action.CLEAR_PHOTO]: 'cleared',
  },

  // image has been cleared from the canvas
  cleared: {
    [action.IMAGE_UPLOAD]: 'idle',
  },
};

export const initialState = 'start';
