/**
 * Application bootstrap entry point
 *
 * This file serves as the main entry point for the application.
 * It creates and initializes the application instance.
 */

import { createApplication, bootstrap } from './main';
import { StateStore } from './state/store';
import { machine } from './state/machine';

// Create state store instance
const store = new StateStore({ stateMachine: machine });

// Create application instance
const app = createApplication(store);

// Initialize when DOM is ready
bootstrap(app);

// Expose app instance for debugging in development
if (import.meta.env.DEV) {
  (window as any).__app = app;
  console.log('Development mode: App instance available as window.__app');
}
