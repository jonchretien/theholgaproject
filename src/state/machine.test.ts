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
    });

    describe('from cleared state', () => {
      it('should transition to idle on IMAGE_UPLOAD', () => {
        const nextState = machine.cleared?.[constant.IMAGE_UPLOAD];
        expect(nextState).toBe('idle');
      });
    });

    describe('from error state', () => {
      it('should have no valid transitions (terminal state)', () => {
        const transitions = machine.error;
        expect(transitions).toEqual({});
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

    it('should handle terminal error state', () => {
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
      expect(filteredActions).toContain(constant.SAVE_IMAGE);
      expect(filteredActions).toContain(constant.CLEAR_CANVAS);
      expect(filteredActions).toHaveLength(2);
    });

    it('should return empty array for error state (terminal)', () => {
      const errorActions = getValidActions('error');
      expect(errorActions).toEqual([]);
    });

    it('should return both filter options for photo state', () => {
      const photoActions = getValidActions('photo');
      expect(photoActions).toContain(constant.APPLY_BW_FILTER);
      expect(photoActions).toContain(constant.APPLY_COLOR_FILTER);
      expect(photoActions).toHaveLength(2);
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

      // Upload another image
      state = getNextState(state, constant.IMAGE_UPLOAD)!;
      expect(state).toBe('idle');
    });

    it('should handle upload failure', () => {
      let state: State = 'upload';

      state = getNextState(state, constant.IMAGE_UPLOAD_FAILURE)!;
      expect(state).toBe('error');

      // Should not be able to transition from error state
      const nextState = getNextState(state, constant.IMAGE_UPLOAD);
      expect(nextState).toBeUndefined();
    });

    it('should handle browser support failure', () => {
      let state: State = 'start';

      state = getNextState(state, constant.BROWSER_SUPPORT_FAILURE)!;
      expect(state).toBe('error');

      // Terminal state
      expect(getValidActions(state)).toHaveLength(0);
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
  });
});
