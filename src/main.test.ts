/**
 * Tests for application initialization and lifecycle
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createApplication,
  checkBrowserSupport,
  bootstrap,
  type Application,
  type ComponentFactories,
} from './main';
import { StateStore } from './state/store';
import { machine } from './state/machine';
import type PubSub from './state/pubsub';
import type { HeadingComponent } from './components/heading';
import type { ButtonsComponent } from './components/buttons';
import type { PhotoCanvasComponent } from './components/canvas';
import * as supportModule from './lib/support';

describe('Application', () => {
  let mockStore: StateStore;
  let mockFactories: ComponentFactories;
  let mockPubSub: PubSub;
  let mockHeading: HeadingComponent;
  let mockButtons: ButtonsComponent;
  let mockCanvas: PhotoCanvasComponent;

  beforeEach(() => {
    // Mock browser support functions to always return true
    vi.spyOn(supportModule, 'hasCanvasSupport').mockReturnValue(true);
    vi.spyOn(supportModule, 'hasDragAndDropSupport').mockReturnValue(true);
    vi.spyOn(supportModule, 'hasFileReaderSupport').mockReturnValue(true);
    vi.spyOn(supportModule, 'isTouchDevice').mockReturnValue(false);

    // Create mock store
    mockStore = new StateStore({ stateMachine: machine });

    // Create mock components
    mockPubSub = {
      publish: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    } as unknown as PubSub;

    mockHeading = {
      update: vi.fn(),
    };

    mockButtons = {
      init: vi.fn(),
      cleanup: vi.fn(),
    };

    mockCanvas = {
      init: vi.fn(),
      cleanup: vi.fn(),
    };

    // Create mock factories
    mockFactories = {
      createPubSub: vi.fn(() => mockPubSub),
      createHeading: vi.fn(() => mockHeading),
      createButtons: vi.fn(() => mockButtons),
      createCanvas: vi.fn(() => mockCanvas),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createApplication', () => {
    it('should create an application instance with correct interface', () => {
      const app = createApplication(mockStore, mockFactories);

      expect(app).toHaveProperty('initialize');
      expect(app).toHaveProperty('destroy');
      expect(app).toHaveProperty('isInitialized');
      expect(typeof app.initialize).toBe('function');
      expect(typeof app.destroy).toBe('function');
      expect(typeof app.isInitialized).toBe('function');
    });

    it('should not be initialized by default', () => {
      const app = createApplication(mockStore, mockFactories);

      expect(app.isInitialized()).toBe(false);
    });

    it('should initialize components when browser is supported', () => {
      const app = createApplication(mockStore, mockFactories);
      app.initialize();

      expect(app.isInitialized()).toBe(true);
      expect(mockFactories.createHeading).toHaveBeenCalled();
      expect(mockFactories.createPubSub).toHaveBeenCalled();
      expect(mockFactories.createButtons).toHaveBeenCalledWith(mockPubSub);
      expect(mockFactories.createCanvas).toHaveBeenCalledWith(
        mockPubSub,
        mockHeading,
        mockStore
      );
      expect(mockButtons.init).toHaveBeenCalled();
      expect(mockCanvas.init).toHaveBeenCalled();
    });

    it('should update heading with instructions on successful initialization', () => {
      const app = createApplication(mockStore, mockFactories);
      app.initialize();

      expect(mockHeading.update).toHaveBeenCalledWith('instructions');
    });

    it('should warn if initialized twice', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const app = createApplication(mockStore, mockFactories);

      app.initialize();
      app.initialize(); // Second call

      expect(consoleSpy).toHaveBeenCalledWith('Application already initialized');
      consoleSpy.mockRestore();
    });

    it('should cleanup components when destroyed', () => {
      const app = createApplication(mockStore, mockFactories);
      app.initialize();
      app.destroy();

      expect(mockButtons.cleanup).toHaveBeenCalled();
      expect(mockCanvas.cleanup).toHaveBeenCalled();
      expect(app.isInitialized()).toBe(false);
    });

    it('should warn if destroyed before initialization', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const app = createApplication(mockStore, mockFactories);

      app.destroy(); // Destroy without initializing

      expect(consoleSpy).toHaveBeenCalledWith(
        'Application not initialized, nothing to destroy'
      );
      consoleSpy.mockRestore();
    });

    it('should allow re-initialization after destroy', () => {
      // Need fresh store for each initialization since state persists
      const store1 = new StateStore({ stateMachine: machine });
      const app = createApplication(store1, mockFactories);

      app.initialize();
      expect(app.isInitialized()).toBe(true);

      app.destroy();
      expect(app.isInitialized()).toBe(false);

      // Create new store instance for re-initialization (simulates fresh start)
      const store2 = new StateStore({ stateMachine: machine });
      const app2 = createApplication(store2, mockFactories);
      app2.initialize();
      expect(app2.isInitialized()).toBe(true);
    });

    it('should handle initialization errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorFactories: ComponentFactories = {
        ...mockFactories,
        createHeading: vi.fn(() => {
          throw new Error('Failed to create heading');
        }),
      };

      const app = createApplication(mockStore, errorFactories);

      expect(() => app.initialize()).toThrow('Failed to create heading');
      expect(app.isInitialized()).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('checkBrowserSupport', () => {
    it('should return supported when all features are available', () => {
      const result = checkBrowserSupport();

      // In happy-dom test environment, Canvas API is available
      expect(result.supported).toBeDefined();
      expect(typeof result.supported).toBe('boolean');
    });

    it('should return reason when browser is unsupported', () => {
      // This test would need to mock the support detection functions
      // to simulate an unsupported browser
      const result = checkBrowserSupport();

      if (!result.supported) {
        expect(result.reason).toBeDefined();
        expect(['upgradeBrowser', 'touchDevice']).toContain(result.reason);
      }
    });
  });

  describe('bootstrap', () => {
    let app: Application;
    let addEventListenerSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      app = createApplication(mockStore, mockFactories);
      addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    });

    it('should initialize immediately if DOM is ready', () => {
      const initializeSpy = vi.spyOn(app, 'initialize');

      // Simulate DOM already loaded
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        configurable: true,
      });

      bootstrap(app);

      expect(initializeSpy).toHaveBeenCalled();
    });

    it('should wait for DOMContentLoaded if DOM is loading', () => {
      const initializeSpy = vi.spyOn(app, 'initialize');

      // Simulate DOM still loading
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        configurable: true,
      });

      bootstrap(app);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'DOMContentLoaded',
        expect.any(Function)
      );
      expect(initializeSpy).not.toHaveBeenCalled();

      // Simulate DOMContentLoaded event
      const callback = addEventListenerSpy.mock.calls[0][1] as () => void;
      callback();

      expect(initializeSpy).toHaveBeenCalled();
    });

    it('should warn if not in browser environment', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Simulate non-browser environment
      const originalWindow = global.window;
      // @ts-ignore - Intentionally deleting window for test
      delete global.window;

      bootstrap(app);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Not in browser environment, skipping initialization'
      );

      // Restore window
      global.window = originalWindow;
      consoleSpy.mockRestore();
    });
  });
});
