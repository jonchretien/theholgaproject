import * as constant from './constants';

/**
 * Application state names
 */
export type State =
  | 'start'   // Initial page load
  | 'idle'    // Waiting for user to upload image
  | 'upload'  // Image is being uploaded
  | 'photo'   // Raw image loaded on canvas
  | 'filtered'// Effects have been applied
  | 'saved'   // Image has been saved
  | 'cleared' // Canvas has been cleared
  | 'error';  // An error occurred

/**
 * State transition map type
 * Maps current state -> action -> next state
 */
export type StateMachine = {
  [K in State]?: Partial<Record<constant.Action, State>>;
};

/**
 * Finite state machine definition
 *
 * This defines all valid state transitions in the application.
 * Each state can only transition to specific next states based on actions.
 *
 * Flow diagram:
 * ```
 * start → idle → upload → photo → filtered → saved
 *   ↓      ↑        ↓        ↓                    ↓
 * error ←──┴────────┘     cleared ←───────────────┘
 *   ↓
 * idle (via RETRY_UPLOAD or RESET_APP)
 * ```
 *
 * Error recovery:
 * - From error state, user can RETRY_UPLOAD to return to idle
 * - From error state, user can RESET_APP to return to start
 *
 * @example
 * ```typescript
 * const currentState = 'idle';
 * const action = IMAGE_UPLOAD;
 * const nextState = machine[currentState]?.[action]; // 'upload'
 * ```
 */
export const machine: StateMachine = {
  // The initial page view
  start: {
    [constant.BROWSER_SUPPORT_SUCCESS]: 'idle',
    [constant.BROWSER_SUPPORT_FAILURE]: 'error',
  },

  // App waits for user to upload image
  idle: {
    [constant.IMAGE_UPLOAD]: 'upload',
  },

  // Image is being uploaded to the canvas
  upload: {
    [constant.IMAGE_UPLOAD_SUCCESS]: 'photo',
    [constant.IMAGE_UPLOAD_FAILURE]: 'error',
  },

  // Raw image has been added to the canvas
  photo: {
    [constant.APPLY_BW_FILTER]: 'filtered',
    [constant.APPLY_COLOR_FILTER]: 'filtered',
    [constant.CLEAR_CANVAS]: 'cleared',
  },

  // Image has been filtered
  filtered: {
    [constant.SAVE_IMAGE]: 'saved',
    [constant.CLEAR_CANVAS]: 'cleared',
  },

  // Image has been saved
  saved: {
    [constant.SAVE_IMAGE]: 'saved', // Allow saving multiple times
    [constant.CLEAR_CANVAS]: 'cleared',
  },

  // Image has been cleared from the canvas
  cleared: {
    [constant.IMAGE_UPLOAD]: 'upload',
  },

  // Error state - now has recovery options!
  error: {
    [constant.RETRY_UPLOAD]: 'idle', // Try uploading a different image
    [constant.RESET_APP]: 'start',   // Full reset (browser support recheck)
  },
};

/**
 * Initial application state
 */
export const initialState: State = 'start';

/**
 * Helper function to get the next state given current state and action
 *
 * @param currentState - The current state
 * @param action - The action being performed
 * @returns The next state, or undefined if transition is invalid
 *
 * @example
 * ```typescript
 * const next = getNextState('idle', IMAGE_UPLOAD); // 'upload'
 * const invalid = getNextState('idle', SAVE_IMAGE); // undefined
 * ```
 */
export function getNextState(
  currentState: State,
  action: constant.Action
): State | undefined {
  return machine[currentState]?.[action];
}

/**
 * Checks if a state transition is valid
 *
 * @param currentState - The current state
 * @param action - The action to perform
 * @returns True if the transition is allowed
 *
 * @example
 * ```typescript
 * isValidTransition('idle', IMAGE_UPLOAD); // true
 * isValidTransition('idle', SAVE_IMAGE); // false
 * ```
 */
export function isValidTransition(
  currentState: State,
  action: constant.Action
): boolean {
  return getNextState(currentState, action) !== undefined;
}

/**
 * Gets all valid actions for a given state
 *
 * @param state - The state to check
 * @returns Array of valid actions for this state
 *
 * @example
 * ```typescript
 * getValidActions('idle'); // [IMAGE_UPLOAD]
 * getValidActions('filtered'); // [SAVE_IMAGE, CLEAR_CANVAS]
 * ```
 */
export function getValidActions(state: State): constant.Action[] {
  const transitions = machine[state];
  if (!transitions) return [];
  return Object.keys(transitions) as constant.Action[];
}
