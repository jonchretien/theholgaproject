/**
 * Application factory and initialization logic
 *
 * This module provides pure functions with no side effects.
 * Import from bootstrap.ts for automatic initialization.
 */

import PubSub from "./state/pubsub";
import { initialState } from "./state/machine";
import { StateStore } from "./state/store";
import {
  BROWSER_SUPPORT_SUCCESS,
  BROWSER_SUPPORT_FAILURE,
} from "./state/constants";
import {
  hasCanvasSupport,
  hasDragAndDropSupport,
  hasFileReaderSupport,
  isTouchDevice,
} from "./lib/support";
import Buttons from "./components/buttons";
import Heading from "./components/heading";
import PhotoCanvas from "./components/canvas";
import type { ButtonsComponent } from "./components/buttons";
import type { HeadingComponent } from "./components/heading";
import type { PhotoCanvasComponent } from "./components/canvas";

/**
 * Browser support check result
 */
export interface BrowserSupportResult {
  supported: boolean;
  reason?: "upgradeBrowser" | "touchDevice";
}

/**
 * Application instance interface
 */
export interface Application {
  initialize: () => void;
  destroy: () => void;
  isInitialized: () => boolean;
}

/**
 * Component factories for dependency injection
 */
export interface ComponentFactories {
  createPubSub: () => PubSub;
  createHeading: () => HeadingComponent;
  createButtons: (pubsub: PubSub) => ButtonsComponent;
  createCanvas: (
    pubsub: PubSub,
    heading: HeadingComponent,
    store: StateStore
  ) => PhotoCanvasComponent;
}

/**
 * Default component factories
 */
const defaultFactories: ComponentFactories = {
  createPubSub: () => new PubSub(),
  createHeading: () => Heading(),
  createButtons: (pubsub) => Buttons(pubsub),
  createCanvas: (pubsub, heading, store) => PhotoCanvas(pubsub, heading, store),
};

/**
 * Checks if the browser supports required features
 *
 * @returns Browser support result with reason if unsupported
 */
export function checkBrowserSupport(): BrowserSupportResult {
  if (
    !hasCanvasSupport() ||
    !hasDragAndDropSupport() ||
    !hasFileReaderSupport()
  ) {
    return { supported: false, reason: "upgradeBrowser" };
  }

  if (isTouchDevice()) {
    return { supported: false, reason: "touchDevice" };
  }

  return { supported: true };
}

/**
 * Handles unsupported browser scenario
 *
 * @param reason - Why the browser is unsupported
 * @param store - State store instance
 * @param factories - Component factories
 */
function handleUnsupportedBrowser(
  reason: "upgradeBrowser" | "touchDevice",
  store: StateStore,
  factories: ComponentFactories
): void {
  try {
    const heading = factories.createHeading();
    if (!heading) {
      console.error("Failed to create heading component");
      return;
    }

    store.setState(initialState, BROWSER_SUPPORT_FAILURE);
    heading.update(reason);
  } catch (error) {
    console.error("Error handling unsupported browser:", error);
  }
}

/**
 * Initializes all application components
 *
 * @param store - State store instance
 * @param factories - Component factories
 * @returns Cleanup function to tear down components
 */
function initializeComponents(
  store: StateStore,
  factories: ComponentFactories
): { cleanup: () => void } {
  const heading = factories.createHeading();
  if (!heading) {
    throw new Error("Failed to create heading component");
  }

  // Set success state and show instructions
  store.setState(initialState, BROWSER_SUPPORT_SUCCESS);
  heading.update("instructions");

  // Create and initialize components
  const pubsub = factories.createPubSub();
  const buttons = factories.createButtons(pubsub);
  const canvas = factories.createCanvas(pubsub, heading, store);

  buttons.init();
  canvas.init();

  // Return cleanup function that tears down all components
  return {
    cleanup: () => {
      canvas.cleanup();
      buttons.cleanup();
    },
  };
}

/**
 * Creates an Application instance using factory pattern
 *
 * @param store - State store for application state management
 * @param factories - Component factories for dependency injection (optional)
 * @returns Application instance with initialize and destroy methods
 *
 * @example
 * ```typescript
 * import storeManager from './state/transition';
 * import { createApplication } from './main';
 *
 * const app = createApplication(storeManager);
 * app.initialize();
 *
 * // Later, cleanup:
 * app.destroy();
 * ```
 */
export function createApplication(
  store: StateStore,
  factories: ComponentFactories = defaultFactories
): Application {
  let initialized = false;
  let cleanup: (() => void) | null = null;

  /**
   * Initializes the application
   */
  function initialize(): void {
    if (initialized) {
      console.warn("Application already initialized");
      return;
    }

    // Check browser support first
    const support = checkBrowserSupport();
    if (!support.supported) {
      handleUnsupportedBrowser(support.reason!, store, factories);
      return;
    }

    // Initialize components
    try {
      const components = initializeComponents(store, factories);
      cleanup = components.cleanup;
      initialized = true;
    } catch (error) {
      console.error("Failed to initialize application:", error);
      throw error;
    }
  }

  /**
   * Destroys the application and cleans up resources
   */
  function destroy(): void {
    if (!initialized) {
      console.warn("Application not initialized, nothing to destroy");
      return;
    }

    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    initialized = false;
  }

  /**
   * Checks if application is initialized
   *
   * @returns True if application has been initialized
   */
  function isInitialized(): boolean {
    return initialized;
  }

  // Return public API
  return {
    initialize,
    destroy,
    isInitialized,
  };
}

/**
 * Bootstrap function - ensures DOM is ready before initialization
 *
 * @param app - Application instance to initialize
 *
 * @example
 * ```typescript
 * import { createApplication, bootstrap } from './main';
 * import storeManager from './state/transition';
 *
 * const app = createApplication(storeManager);
 * bootstrap(app);
 * ```
 */
export function bootstrap(app: Application): void {
  if (typeof window === "undefined") {
    console.warn("Not in browser environment, skipping initialization");
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => app.initialize());
  } else {
    app.initialize();
  }
}
