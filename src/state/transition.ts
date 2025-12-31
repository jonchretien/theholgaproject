/**
 * Backward-compatible singleton export for StateStore
 *
 * This module maintains the same API as the old transition.js file
 * while using the new decoupled StateStore implementation.
 *
 * @deprecated Use StateStore class directly with dependency injection instead
 */

import { StateStore } from './store';
import { machine } from './machine';

/**
 * Singleton instance of StateStore
 * Created once and exported for backward compatibility with existing code
 */
const storeManager = new StateStore({ stateMachine: machine });

/**
 * @deprecated Import StateStore directly and create instances as needed
 */
export default storeManager;
