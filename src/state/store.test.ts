/**
 * Unit tests for StateStore
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateStore, STATE_CHANGED, type StateChangeEvent } from './store';
import { machine, initialState, type State } from './machine';
import * as constant from './constants';
import PubSub from './pubsub';

describe('StateStore', () => {
  let store: StateStore;

  beforeEach(() => {
    store = new StateStore({ stateMachine: machine });
  });

  describe('constructor', () => {
    it('should initialize with default initial state', () => {
      expect(store.getState()).toBe('start');
    });

    it('should initialize with custom initial state', () => {
      const customStore = new StateStore({
        stateMachine: machine,
        initialState: 'idle',
      });
      expect(customStore.getState()).toBe('idle');
    });

    it('should accept a state machine dependency', () => {
      const mockMachine = {
        start: { [constant.BROWSER_SUPPORT_SUCCESS]: 'idle' as State },
      };
      const customStore = new StateStore({ stateMachine: mockMachine });
      expect(customStore.getState()).toBe('start');
    });
  });

  describe('getState', () => {
    it('should return the current state', () => {
      expect(store.getState()).toBe('start');
    });
  });

  describe('setState', () => {
    it('should transition to next state for valid action', () => {
      const newState = store.setState('start', constant.BROWSER_SUPPORT_SUCCESS);
      expect(newState).toBe('idle');
      expect(store.getState()).toBe('idle');
    });

    it('should throw error if state parameter does not match current state', () => {
      expect(() => {
        store.setState('idle', constant.IMAGE_UPLOAD);
      }).toThrow('State mismatch');
    });

    it('should throw error for invalid transition', () => {
      expect(() => {
        store.setState('start', constant.IMAGE_UPLOAD);
      }).toThrow('Invalid transition');
    });

    it('should return the new state after transition', () => {
      const newState = store.setState('start', constant.BROWSER_SUPPORT_SUCCESS);
      expect(newState).toBe('idle');
    });

    it('should handle multiple transitions', () => {
      store.setState('start', constant.BROWSER_SUPPORT_SUCCESS);
      expect(store.getState()).toBe('idle');

      store.setState('idle', constant.IMAGE_UPLOAD);
      expect(store.getState()).toBe('upload');

      store.setState('upload', constant.IMAGE_UPLOAD_SUCCESS);
      expect(store.getState()).toBe('photo');
    });
  });

  describe('reset', () => {
    it('should reset to default initial state', () => {
      store.setState('start', constant.BROWSER_SUPPORT_SUCCESS);
      expect(store.getState()).toBe('idle');

      store.reset();
      expect(store.getState()).toBe('start');
    });

    it('should reset to custom state', () => {
      store.setState('start', constant.BROWSER_SUPPORT_SUCCESS);
      expect(store.getState()).toBe('idle');

      store.reset('error');
      expect(store.getState()).toBe('error');
    });
  });

  describe('canTransition', () => {
    it('should return true for valid transition', () => {
      expect(store.canTransition(constant.BROWSER_SUPPORT_SUCCESS)).toBe(true);
    });

    it('should return false for invalid transition', () => {
      expect(store.canTransition(constant.IMAGE_UPLOAD)).toBe(false);
    });

    it('should reflect current state', () => {
      store.setState('start', constant.BROWSER_SUPPORT_SUCCESS);
      expect(store.canTransition(constant.IMAGE_UPLOAD)).toBe(true);
      expect(store.canTransition(constant.BROWSER_SUPPORT_SUCCESS)).toBe(false);
    });
  });

  describe('getValidActions', () => {
    it('should return valid actions for current state', () => {
      const actions = store.getValidActions();
      expect(actions).toContain(constant.BROWSER_SUPPORT_SUCCESS);
      expect(actions).toContain(constant.BROWSER_SUPPORT_FAILURE);
    });

    it('should return recovery actions for error state', () => {
      const errorStore = new StateStore({
        stateMachine: machine,
        initialState: 'error',
      });
      const actions = errorStore.getValidActions();
      expect(actions).toContain(constant.RETRY_UPLOAD);
      expect(actions).toContain(constant.RESET_APP);
      expect(actions).toHaveLength(2);
    });

    it('should update after state transition', () => {
      store.setState('start', constant.BROWSER_SUPPORT_SUCCESS);
      const actions = store.getValidActions();
      expect(actions).toContain(constant.IMAGE_UPLOAD);
      expect(actions).toHaveLength(1);
    });
  });

  describe('PubSub integration', () => {
    let pubsub: PubSub;
    let storeWithPubSub: StateStore;

    beforeEach(() => {
      pubsub = new PubSub();
      storeWithPubSub = new StateStore({
        stateMachine: machine,
        pubsub,
      });
    });

    it('should publish state change events', () => {
      const callback = vi.fn<[StateChangeEvent]>();
      pubsub.subscribe(STATE_CHANGED, callback);

      storeWithPubSub.setState('start', constant.BROWSER_SUPPORT_SUCCESS);

      expect(callback).toHaveBeenCalledWith({
        previousState: 'start',
        currentState: 'idle',
        action: constant.BROWSER_SUPPORT_SUCCESS,
      });
    });

    it('should not publish if no pubsub provided', () => {
      const callback = vi.fn();
      pubsub.subscribe(STATE_CHANGED, callback);

      // Use store without pubsub
      store.setState('start', constant.BROWSER_SUPPORT_SUCCESS);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should publish event for each transition', () => {
      const callback = vi.fn<[StateChangeEvent]>();
      pubsub.subscribe(STATE_CHANGED, callback);

      storeWithPubSub.setState('start', constant.BROWSER_SUPPORT_SUCCESS);
      storeWithPubSub.setState('idle', constant.IMAGE_UPLOAD);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, {
        previousState: 'start',
        currentState: 'idle',
        action: constant.BROWSER_SUPPORT_SUCCESS,
      });
      expect(callback).toHaveBeenNthCalledWith(2, {
        previousState: 'idle',
        currentState: 'upload',
        action: constant.IMAGE_UPLOAD,
      });
    });
  });

  describe('Error handling', () => {
    it('should provide helpful error message for state mismatch', () => {
      expect(() => {
        store.setState('idle', constant.IMAGE_UPLOAD);
      }).toThrow("State mismatch: expected 'start', got 'idle'");
    });

    it('should provide helpful error message for invalid transition', () => {
      expect(() => {
        store.setState('start', constant.IMAGE_UPLOAD);
      }).toThrow(
        "Invalid transition: no transition from 'start' with action 'IMAGE_UPLOAD'"
      );
    });
  });

  describe('Dependency Injection benefits', () => {
    it('should work with custom state machine', () => {
      const customMachine = {
        start: { [constant.BROWSER_SUPPORT_SUCCESS]: 'custom' as State },
        custom: {},
      };

      const customStore = new StateStore({ stateMachine: customMachine });
      const newState = customStore.setState(
        'start',
        constant.BROWSER_SUPPORT_SUCCESS
      );

      expect(newState).toBe('custom');
    });

    it('should be testable with mock state machine', () => {
      const mockMachine = {
        start: { TEST_ACTION: 'end' as State },
        end: {},
      };

      const testStore = new StateStore({ stateMachine: mockMachine });
      const newState = testStore.setState('start', 'TEST_ACTION' as constant.Action);

      expect(newState).toBe('end');
    });
  });
});
