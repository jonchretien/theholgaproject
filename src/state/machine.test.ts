/**
 * Unit tests for finite state machine
 */
import { describe, it, expect } from 'vitest';
import {
  machine,
  initialState,
  getNextState,
  isValidTransition,
  getValidActions,
  type State,
} from './machine';
import * as constant from './constants';

describe('State Machine', () => {
  describe('initialState', () => {
    it('should be "start"', () => {
      expect(initialState).toBe('start');
    });
  });

  describe('machine structure', () => {
    it('should have all required states', () => {
      const states: State[] = [
        'start',
        'idle',
        'upload',
        'photo',
        'filtered',
        'saved',
        'cleared',
        'error',
      ];

      states.forEach((state) => {
        expect(machine).toHaveProperty(state);
      });
    });
  });

  describe('State transitions', () => {
    describe('from start state', () => {
      it('should transition to idle on BROWSER_SUPPORT_SUCCESS', () => {
        const nextState = machine.start?.[constant.BROWSER_SUPPORT_SUCCESS];
        expect(nextState).toBe('idle');
      });

      it('should transition to error on BROWSER_SUPPORT_FAILURE', () => {
        const nextState = machine.start?.[constant.BROWSER_SUPPORT_FAILURE];
        expect(nextState).toBe('error');
      });
    });

    describe('from idle state', () => {
      it('should transition to upload on IMAGE_UPLOAD', () => {
        const nextState = machine.idle?.[constant.IMAGE_UPLOAD];
        expect(nextState).toBe('upload');
      });

      it('should not have transitions for invalid actions', () => {
        const nextState = machine.idle?.[constant.SAVE_IMAGE];
        expect(nextState).toBeUndefined();
      });
    });

    describe('from upload state', () => {
      it('should transition to photo on IMAGE_UPLOAD_SUCCESS', () => {
        const nextState = machine.upload?.[constant.IMAGE_UPLOAD_SUCCESS];
        expect(nextState).toBe('photo');
      });

      it('should transition to error on IMAGE_UPLOAD_FAILURE', () => {
        const nextState = machine.upload?.[constant.IMAGE_UPLOAD_FAILURE];
        expect(nextState).toBe('error');
      });
    });

    describe('from photo state', () => {
      it('should transition to filtered on APPLY_BW_FILTER', () => {
        const nextState = machine.photo?.[constant.APPLY_BW_FILTER];
        expect(nextState).toBe('filtered');
      });

      it('should transition to filtered on APPLY_COLOR_FILTER', () => {
        const nextState = machine.photo?.[constant.APPLY_COLOR_FILTER];
        expect(nextState).toBe('filtered');
      });

      it('should stay in photo on REMOVE_FILTER', () => {
        const nextState = machine.photo?.[constant.REMOVE_FILTER];
        expect(nextState).toBe('photo');
      });

      it('should transition to upload on IMAGE_UPLOAD (allow re-upload)', () => {
        const nextState = machine.photo?.[constant.IMAGE_UPLOAD];
        expect(nextState).toBe('upload');
      });
    });

    describe('from filtered state', () => {
      it('should transition to saved on SAVE_IMAGE', () => {
        const nextState = machine.filtered?.[constant.SAVE_IMAGE];
        expect(nextState).toBe('saved');
      });

      it('should transition to cleared on CLEAR_CANVAS', () => {
        const nextState = machine.filtered?.[constant.CLEAR_CANVAS];
        expect(nextState).toBe('cleared');
      });

      it('should transition to photo on REMOVE_FILTER', () => {
        const nextState = machine.filtered?.[constant.REMOVE_FILTER];
        expect(nextState).toBe('photo');
      });

      it('should transition to upload on IMAGE_UPLOAD (allow re-upload)', () => {
        const nextState = machine.filtered?.[constant.IMAGE_UPLOAD];
        expect(nextState).toBe('upload');
      });
    });

    describe('from saved state', () => {
      it('should stay in saved on SAVE_IMAGE (allow multiple saves)', () => {
        const nextState = machine.saved?.[constant.SAVE_IMAGE];
        expect(nextState).toBe('saved');
      });

      it('should transition to cleared on CLEAR_CANVAS', () => {
        const nextState = machine.saved?.[constant.CLEAR_CANVAS];
        expect(nextState).toBe('cleared');
      });

      it('should transition to photo on REMOVE_FILTER', () => {
        const nextState = machine.saved?.[constant.REMOVE_FILTER];
        expect(nextState).toBe('photo');
      });

      it('should transition to upload on IMAGE_UPLOAD (allow re-upload)', () => {
        const nextState = machine.saved?.[constant.IMAGE_UPLOAD];
        expect(nextState).toBe('upload');
      });
    });

    describe('from cleared state', () => {
      it('should transition to upload on IMAGE_UPLOAD', () => {
        const nextState = machine.cleared?.[constant.IMAGE_UPLOAD];
        expect(nextState).toBe('upload');
      });
    });

    describe('from error state', () => {
      it('should allow recovery via RETRY_UPLOAD', () => {
        const nextState = machine.error?.[constant.RETRY_UPLOAD];
        expect(nextState).toBe('idle');
      });

      it('should allow full reset via RESET_APP', () => {
        const nextState = machine.error?.[constant.RESET_APP];
        expect(nextState).toBe('start');
      });

      it('should not allow invalid actions from error state', () => {
        const nextState = machine.error?.[constant.IMAGE_UPLOAD];
        expect(nextState).toBeUndefined();
      });
    });
  });

  describe('getNextState', () => {
    it('should return correct next state for valid transition', () => {
      expect(getNextState('idle', constant.IMAGE_UPLOAD)).toBe('upload');
      expect(getNextState('upload', constant.IMAGE_UPLOAD_SUCCESS)).toBe(
        'photo'
      );
      expect(getNextState('photo', constant.APPLY_BW_FILTER)).toBe('filtered');
    });

    it('should return undefined for invalid transition', () => {
      expect(getNextState('idle', constant.SAVE_IMAGE)).toBeUndefined();
      expect(getNextState('start', constant.IMAGE_UPLOAD)).toBeUndefined();
    });

    it('should handle error recovery', () => {
      expect(getNextState('error', constant.RETRY_UPLOAD)).toBe('idle');
      expect(getNextState('error', constant.RESET_APP)).toBe('start');
    });

    it('should reject invalid actions from error state', () => {
      expect(getNextState('error', constant.IMAGE_UPLOAD)).toBeUndefined();
      expect(
        getNextState('error', constant.BROWSER_SUPPORT_SUCCESS)
      ).toBeUndefined();
    });
  });

  describe('isValidTransition', () => {
    it('should return true for valid transitions', () => {
      expect(isValidTransition('idle', constant.IMAGE_UPLOAD)).toBe(true);
      expect(
        isValidTransition('upload', constant.IMAGE_UPLOAD_SUCCESS)
      ).toBe(true);
      expect(isValidTransition('photo', constant.APPLY_BW_FILTER)).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(isValidTransition('idle', constant.SAVE_IMAGE)).toBe(false);
      expect(isValidTransition('start', constant.IMAGE_UPLOAD)).toBe(false);
      expect(isValidTransition('error', constant.IMAGE_UPLOAD)).toBe(false);
    });
  });

  describe('getValidActions', () => {
    it('should return all valid actions for a state', () => {
      const idleActions = getValidActions('idle');
      expect(idleActions).toContain(constant.IMAGE_UPLOAD);
      expect(idleActions).toHaveLength(1);
    });

    it('should return multiple actions when state has multiple transitions', () => {
      const filteredActions = getValidActions('filtered');
      expect(filteredActions).toContain(constant.IMAGE_UPLOAD);
      expect(filteredActions).toContain(constant.APPLY_BW_FILTER);
      expect(filteredActions).toContain(constant.APPLY_COLOR_FILTER);
      expect(filteredActions).toContain(constant.REMOVE_FILTER);
      expect(filteredActions).toContain(constant.SAVE_IMAGE);
      expect(filteredActions).toContain(constant.CLEAR_CANVAS);
      expect(filteredActions).toHaveLength(6);
    });

    it('should return recovery actions for error state', () => {
      const errorActions = getValidActions('error');
      expect(errorActions).toContain(constant.RETRY_UPLOAD);
      expect(errorActions).toContain(constant.RESET_APP);
      expect(errorActions).toHaveLength(2);
    });

    it('should return filter and clear options for photo state', () => {
      const photoActions = getValidActions('photo');
      expect(photoActions).toContain(constant.IMAGE_UPLOAD);
      expect(photoActions).toContain(constant.APPLY_BW_FILTER);
      expect(photoActions).toContain(constant.APPLY_COLOR_FILTER);
      expect(photoActions).toContain(constant.REMOVE_FILTER);
      expect(photoActions).toContain(constant.CLEAR_CANVAS);
      expect(photoActions).toHaveLength(5);
    });
  });

  describe('State flow scenarios', () => {
    it('should handle successful image upload and filter flow', () => {
      let state: State = 'start';

      // Browser support check
      state = getNextState(state, constant.BROWSER_SUPPORT_SUCCESS)!;
      expect(state).toBe('idle');

      // Upload image
      state = getNextState(state, constant.IMAGE_UPLOAD)!;
      expect(state).toBe('upload');

      // Upload succeeds
      state = getNextState(state, constant.IMAGE_UPLOAD_SUCCESS)!;
      expect(state).toBe('photo');

      // Apply filter
      state = getNextState(state, constant.APPLY_BW_FILTER)!;
      expect(state).toBe('filtered');

      // Save image
      state = getNextState(state, constant.SAVE_IMAGE)!;
      expect(state).toBe('saved');

      // Clear canvas
      state = getNextState(state, constant.CLEAR_CANVAS)!;
      expect(state).toBe('cleared');

      // Upload another image (goes directly to upload state)
      state = getNextState(state, constant.IMAGE_UPLOAD)!;
      expect(state).toBe('upload');
    });

    it('should handle upload failure with recovery', () => {
      let state: State = 'upload';

      state = getNextState(state, constant.IMAGE_UPLOAD_FAILURE)!;
      expect(state).toBe('error');

      // Can't directly upload from error
      expect(getNextState(state, constant.IMAGE_UPLOAD)).toBeUndefined();

      // But can retry to go back to idle
      state = getNextState(state, constant.RETRY_UPLOAD)!;
      expect(state).toBe('idle');

      // Now can upload again
      state = getNextState(state, constant.IMAGE_UPLOAD)!;
      expect(state).toBe('upload');
    });

    it('should handle browser support failure with recovery', () => {
      let state: State = 'start';

      state = getNextState(state, constant.BROWSER_SUPPORT_FAILURE)!;
      expect(state).toBe('error');

      // Can recover from error
      expect(getValidActions(state)).toContain(constant.RETRY_UPLOAD);
      expect(getValidActions(state)).toContain(constant.RESET_APP);

      // Recovery to idle
      state = getNextState(state, constant.RETRY_UPLOAD)!;
      expect(state).toBe('idle');
    });

    it('should allow saving multiple times', () => {
      let state: State = 'saved';

      // Save again
      state = getNextState(state, constant.SAVE_IMAGE)!;
      expect(state).toBe('saved');

      // Can save indefinitely
      state = getNextState(state, constant.SAVE_IMAGE)!;
      expect(state).toBe('saved');
    });

    it('should allow re-uploading from photo, filtered, and saved states', () => {
      let state: State = 'idle';

      // First upload
      state = getNextState(state, constant.IMAGE_UPLOAD)!;
      expect(state).toBe('upload');

      state = getNextState(state, constant.IMAGE_UPLOAD_SUCCESS)!;
      expect(state).toBe('photo');

      // Re-upload from photo state
      state = getNextState(state, constant.IMAGE_UPLOAD)!;
      expect(state).toBe('upload');

      state = getNextState(state, constant.IMAGE_UPLOAD_SUCCESS)!;
      expect(state).toBe('photo');

      // Apply filter
      state = getNextState(state, constant.APPLY_BW_FILTER)!;
      expect(state).toBe('filtered');

      // Re-upload from filtered state
      state = getNextState(state, constant.IMAGE_UPLOAD)!;
      expect(state).toBe('upload');

      state = getNextState(state, constant.IMAGE_UPLOAD_SUCCESS)!;
      expect(state).toBe('photo');

      // Filter and save
      state = getNextState(state, constant.APPLY_COLOR_FILTER)!;
      expect(state).toBe('filtered');

      state = getNextState(state, constant.SAVE_IMAGE)!;
      expect(state).toBe('saved');

      // Re-upload from saved state
      state = getNextState(state, constant.IMAGE_UPLOAD)!;
      expect(state).toBe('upload');

      state = getNextState(state, constant.IMAGE_UPLOAD_SUCCESS)!;
      expect(state).toBe('photo');
    });
  });
});
