/**
 * Application bootstrap entry point
 *
 * This file serves as the main entry point for the application.
 * It creates and initializes the application instance.
 */

import { createApplication, bootstrap } from './main';
import storeManager from './state/transition';

// Create application instance
const app = createApplication(storeManager);

// Initialize when DOM is ready
bootstrap(app);

// Expose app instance for debugging in development
if (import.meta.env.DEV) {
  (window as any).__app = app;
  console.log('Development mode: App instance available as window.__app');
}
