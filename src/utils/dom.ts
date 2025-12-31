/**
 * DOM Utility Functions
 *
 * Provides convenient shortcuts for common DOM queries.
 */

/**
 * Query selector for a single element
 * Returns the first element that matches the selector
 *
 * @example
 * ```typescript
 * const button = $('button.primary');
 * const canvas = $<HTMLCanvasElement>('#myCanvas');
 * ```
 */
export const $: <E extends Element = Element>(
  selector: string
) => E | null = document.querySelector.bind(document);

/**
 * Query selector for multiple elements
 * Returns all elements that match the selector
 *
 * @example
 * ```typescript
 * const buttons = $$('button');
 * const inputs = $$<HTMLInputElement>('input[type="text"]');
 * ```
 */
export const $$: <E extends Element = Element>(
  selector: string
) => NodeListOf<E> = document.querySelectorAll.bind(document);
