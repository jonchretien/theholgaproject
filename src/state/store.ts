/**
 * State store for managing application state
 *
 * This module separates state storage from state transition logic,
 * following the Single Responsibility Principle.
 */

import {
  type State,
  type StateMachine,
  initialState as defaultInitialState,
} from "./machine";
import type { Action } from "./constants";
import PubSub from "./pubsub";

/**
 * State change event payload
 */
export interface StateChangeEvent {
  previousState: State;
  currentState: State;
  action: Action;
}

/**
 * Topic for state change notifications
 */
export const STATE_CHANGED = "STATE_CHANGED" as const;

/**
 * Configuration options for StateStore
 */
export interface StateStoreConfig {
  initialState?: State;
  stateMachine: StateMachine;
  pubsub?: PubSub;
}

/**
 * StateStore class - manages application state with dependency injection
 *
 * @example
 * ```typescript
 * const pubsub = new PubSub();
 * const store = new StateStore({ stateMachine: machine, pubsub });
 *
 * // Subscribe to state changes
 * pubsub.subscribe(STATE_CHANGED, ({ currentState, action }) => {
 *   console.log(`State changed to ${currentState} via ${action}`);
 * });
 *
 * // Perform state transition
 * const newState = store.setState('idle', IMAGE_UPLOAD);
 * ```
 */
export class StateStore {
  private currentState: State;
  private readonly stateMachine: StateMachine;
  private readonly pubsub?: PubSub;

  /**
   * Creates a new StateStore instance
   *
   * @param config - Configuration options
   */
  constructor(config: StateStoreConfig) {
    this.currentState = config.initialState ?? defaultInitialState;
    this.stateMachine = config.stateMachine;
    if (config.pubsub !== undefined) {
      this.pubsub = config.pubsub;
    }
  }

  /**
   * Transitions to the next state based on current state and action
   *
   * @param state - The current state (for validation)
   * @param action - The action to perform
   * @returns The new state after transition
   * @throws {Error} If the state parameter doesn't match internal state
   * @throws {Error} If the transition is invalid
   *
   * @example
   * ```typescript
   * const newState = store.setState('idle', IMAGE_UPLOAD);
   * console.log(newState); // 'upload'
   * ```
   */
  setState(state: State, action: Action): State {
    // Validate that provided state matches current state
    if (state !== this.currentState) {
      throw new Error(
        `State mismatch: expected '${this.currentState}', got '${state}'`
      );
    }

    // Look up the next state in the state machine
    const nextState = this.stateMachine[state]?.[action];

    if (nextState === undefined) {
      throw new Error(
        `Invalid transition: no transition from '${state}' with action '${action}'`
      );
    }

    // Store previous state for event notification
    const previousState = this.currentState;

    // Perform the transition
    this.currentState = nextState;

    // Notify subscribers of state change
    if (this.pubsub) {
      this.pubsub.publish<StateChangeEvent>(STATE_CHANGED, {
        previousState,
        currentState: this.currentState,
        action,
      });
    }

    return this.currentState;
  }

  /**
   * Gets the current state
   *
   * @returns The current state
   */
  getState(): State {
    return this.currentState;
  }

  /**
   * Resets the state to initial state
   * Useful for testing and error recovery
   *
   * @param initialState - Optional state to reset to (defaults to 'start')
   */
  reset(initialState: State = defaultInitialState): void {
    this.currentState = initialState;
  }

  /**
   * Checks if a transition is valid from the current state
   *
   * @param action - The action to check
   * @returns True if the transition is valid
   */
  canTransition(action: Action): boolean {
    return this.stateMachine[this.currentState]?.[action] !== undefined;
  }

  /**
   * Gets all valid actions for the current state
   *
   * @returns Array of valid actions
   */
  getValidActions(): Action[] {
    const transitions = this.stateMachine[this.currentState];
    if (!transitions) return [];
    return Object.keys(transitions) as Action[];
  }
}

/**
 * Factory function to create a StateStore singleton instance
 * This is for backward compatibility with the old singleton pattern
 *
 * @param config - Configuration options
 * @returns StateStore instance
 */
export function createStateStore(config: StateStoreConfig): StateStore {
  return new StateStore(config);
}
