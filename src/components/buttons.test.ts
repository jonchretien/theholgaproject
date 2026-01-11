/**
 * Buttons component tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Buttons from "./buttons";
import type PubSub from "@/state/pubsub";
import {
  ADD_BUTTON_EVENTS,
  REMOVE_BUTTON_EVENTS,
  APPLY_BW_FILTER,
  APPLY_COLOR_FILTER,
  CLEAR_CANVAS,
  SAVE_IMAGE,
} from "@/state/constants";

describe("Buttons event cleanup", () => {
  let mockPubSub: PubSub;
  let subscriptions: Map<string, Function>;

  beforeEach(() => {
    // Create DOM structure with buttons
    document.body.innerHTML = `
      <button class="btn-canvas-action" data-action="${APPLY_BW_FILTER}">B&W Filter</button>
      <button class="btn-canvas-action" data-action="${APPLY_COLOR_FILTER}">Color Filter</button>
      <button class="btn-canvas-action" data-action="${CLEAR_CANVAS}">Clear</button>
      <button class="btn-canvas-action" data-action="${SAVE_IMAGE}">Save</button>
    `;

    // Track subscriptions
    subscriptions = new Map();

    // Create mock PubSub
    mockPubSub = {
      subscribe: vi.fn((topic: string, callback: Function) => {
        subscriptions.set(topic, callback);
      }),
      unsubscribe: vi.fn(),
      publish: vi.fn(),
    } as unknown as PubSub;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    subscriptions.clear();
  });

  it("should subscribe to ADD_BUTTON_EVENTS and REMOVE_BUTTON_EVENTS on init", () => {
    const buttons = Buttons(mockPubSub);
    buttons.init();

    expect(mockPubSub.subscribe).toHaveBeenCalledWith(
      ADD_BUTTON_EVENTS,
      expect.any(Function)
    );
    expect(mockPubSub.subscribe).toHaveBeenCalledWith(
      REMOVE_BUTTON_EVENTS,
      expect.any(Function)
    );
  });

  it("should add click listeners and enable buttons when ADD_BUTTON_EVENTS is published", () => {
    const buttons = Buttons(mockPubSub);
    buttons.init();

    // Get the callback for ADD_BUTTON_EVENTS
    const addCallback = subscriptions.get(ADD_BUTTON_EVENTS);
    expect(addCallback).toBeDefined();

    // All buttons should start disabled (no disabled attribute means enabled in test env)
    const buttonElements = document.querySelectorAll("button");

    // Call the add events callback
    addCallback?.();

    // Verify buttons are enabled (disabled attribute removed)
    buttonElements.forEach((btn) => {
      expect(btn.hasAttribute("disabled")).toBe(false);
    });
  });

  it("should remove click listeners and disable buttons when REMOVE_BUTTON_EVENTS is published", () => {
    const buttons = Buttons(mockPubSub);
    buttons.init();

    // Add listeners first
    const addCallback = subscriptions.get(ADD_BUTTON_EVENTS);
    addCallback?.();

    // Get the callback for REMOVE_BUTTON_EVENTS
    const removeCallback = subscriptions.get(REMOVE_BUTTON_EVENTS);
    expect(removeCallback).toBeDefined();

    // Call the remove events callback
    removeCallback?.();

    // Verify buttons are disabled
    const buttonElements = document.querySelectorAll("button");
    buttonElements.forEach((btn) => {
      expect(btn.getAttribute("disabled")).toBe("true");
    });
  });

  it("should publish button action when clicked", () => {
    const buttons = Buttons(mockPubSub);
    buttons.init();

    // Add listeners
    const addCallback = subscriptions.get(ADD_BUTTON_EVENTS);
    addCallback?.();

    // Click a button
    const bwButton = document.querySelector(
      `button[data-action="${APPLY_BW_FILTER}"]`
    ) as HTMLButtonElement;
    bwButton.click();

    // Verify the action was published
    expect(mockPubSub.publish).toHaveBeenCalledWith(APPLY_BW_FILTER);
  });

  it("should handle multiple add/remove cycles", () => {
    const buttons = Buttons(mockPubSub);
    buttons.init();

    const addCallback = subscriptions.get(ADD_BUTTON_EVENTS);
    const removeCallback = subscriptions.get(REMOVE_BUTTON_EVENTS);

    const buttonElements = document.querySelectorAll("button");

    // Cycle 1: Add
    addCallback?.();
    buttonElements.forEach((btn) => {
      expect(btn.hasAttribute("disabled")).toBe(false);
    });

    // Cycle 1: Remove
    removeCallback?.();
    buttonElements.forEach((btn) => {
      expect(btn.getAttribute("disabled")).toBe("true");
    });

    // Cycle 2: Add again
    addCallback?.();
    buttonElements.forEach((btn) => {
      expect(btn.hasAttribute("disabled")).toBe(false);
    });

    // Cycle 2: Remove again
    removeCallback?.();
    buttonElements.forEach((btn) => {
      expect(btn.getAttribute("disabled")).toBe("true");
    });
  });

  it("should unsubscribe from PubSub events on cleanup", () => {
    const buttons = Buttons(mockPubSub);
    buttons.init();
    buttons.cleanup();

    expect(mockPubSub.unsubscribe).toHaveBeenCalledWith(
      ADD_BUTTON_EVENTS,
      expect.any(Function)
    );
    expect(mockPubSub.unsubscribe).toHaveBeenCalledWith(
      REMOVE_BUTTON_EVENTS,
      expect.any(Function)
    );
  });

  it("should handle multiple cleanup calls safely", () => {
    const buttons = Buttons(mockPubSub);
    buttons.init();

    // Multiple cleanup calls should be safe
    expect(() => buttons.cleanup()).not.toThrow();
    expect(() => buttons.cleanup()).not.toThrow();
  });

  it("should abort event listeners on cleanup", () => {
    const buttons = Buttons(mockPubSub);
    buttons.init();

    // Add listeners
    const addCallback = subscriptions.get(ADD_BUTTON_EVENTS);
    addCallback?.();

    // Reset mock to track new calls
    vi.clearAllMocks();

    // Cleanup
    buttons.cleanup();

    // Click a button - should not publish action after cleanup
    const bwButton = document.querySelector(
      `button[data-action="${APPLY_BW_FILTER}"]`
    ) as HTMLButtonElement;
    bwButton.click();

    // Verify the action was NOT published after cleanup
    expect(mockPubSub.publish).not.toHaveBeenCalled();
  });

  it("should handle multiple addEvents calls without duplicating listeners", () => {
    const buttons = Buttons(mockPubSub);
    buttons.init();

    const addCallback = subscriptions.get(ADD_BUTTON_EVENTS);

    // Add listeners multiple times
    addCallback?.();
    addCallback?.();
    addCallback?.();

    // Reset mock to track new calls
    vi.clearAllMocks();

    // Click should only publish once (not 3 times)
    const bwButton = document.querySelector(
      `button[data-action="${APPLY_BW_FILTER}"]`
    ) as HTMLButtonElement;
    bwButton.click();

    expect(mockPubSub.publish).toHaveBeenCalledTimes(1);
    expect(mockPubSub.publish).toHaveBeenCalledWith(APPLY_BW_FILTER);
  });
});
