import * as constant from './constants';

/**
 * Finite state machine
 */
export const machine = {
  // the initial page view
  start: {
    [constant.BROWSER_SUPPORT_SUCCESS]: 'idle',
    [constant.BROWSER_SUPPORT_FAILURE]: 'error',
  },

  // app waits for user to upload image
  idle: {
    [constant.IMAGE_UPLOAD]: 'upload',
  },

  // image is being uploaded to the canvas
  upload: {
    [constant.IMAGE_UPLOAD_SUCCESS]: 'photo',
    [constant.IMAGE_UPLOAD_FAILURE]: 'error',
  },

  // raw image has been added to the canvas
  photo: {
    [constant.APPLY_BW_FILTER]: 'filtered',
  },

  // image has been filtered
  filtered: {
    [constant.SAVE_IMAGE]: 'saved',
    [constant.CLEAR_CANVAS]: 'cleared',
  },

  // image has been saved
  saved: {
    [constant.SAVE_IMAGE]: 'saved',
    [constant.CLEAR_CANVAS]: 'cleared',
  },

  // image has been cleared from the canvas
  cleared: {
    [constant.IMAGE_UPLOAD]: 'idle',
  },
};

export const initialState = 'start';
