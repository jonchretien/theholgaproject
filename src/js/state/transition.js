import { initialState, machine } from './machine';

const StoreManager = () => {
  let _state = initialState;

  return {
    /**
     * Transition to the next state based on an action that's
     * look-up of the currentState and action in the
     * machine object.
     * @param {String} currentState
     * @param {String} action
     */
    setState(state = initialState, action) {
      const nextState = machine[state][action];
      _state = nextState;
      return _state;
    },

    getState() {
      return _state;
    },
  };
};

const storeManager = StoreManager();

export default storeManager;
