/**
 * PubSub class for managing publish-subscribe pattern.
 * Provides type-safe event-driven communication between components.
 */

/**
 * Callback function type for subscribers
 */
export type SubscriberCallback<T = unknown> = (data: T) => void;

/**
 * PubSub class for decoupled component communication
 *
 * @example
 * ```typescript
 * const pubsub = new PubSub();
 *
 * // Subscribe to a topic
 * pubsub.subscribe('user-login', (data) => {
 *   console.log('User logged in:', data);
 * });
 *
 * // Publish to a topic
 * pubsub.publish('user-login', { userId: 123 });
 *
 * // Unsubscribe
 * pubsub.unsubscribe('user-login', callback);
 * ```
 */
export default class PubSub {
  /**
   * Map of topic names to sets of subscriber callbacks
   * Using Set ensures no duplicate callbacks for the same topic
   */
  private subscribers: Map<string, Set<SubscriberCallback>>;

  /**
   * Creates an instance of PubSub.
   */
  constructor() {
    this.subscribers = new Map<string, Set<SubscriberCallback>>();
  }

  /**
   * Subscribes a callback function to a specific topic.
   *
   * @param topic - The topic to subscribe to
   * @param callback - The callback function to be called when the topic is published
   *
   * @example
   * ```typescript
   * pubsub.subscribe('IMAGE_UPLOADED', (imageData) => {
   *   console.log('Image received:', imageData);
   * });
   * ```
   */
  subscribe<T = unknown>(topic: string, callback: SubscriberCallback<T>): void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    // Type assertion needed because Set doesn't know the specific callback type
    this.subscribers.get(topic)!.add(callback as SubscriberCallback);
  }

  /**
   * Publishes data to a specific topic, invoking all subscribed callbacks.
   *
   * @param topic - The topic to publish to
   * @param data - The data to be passed to the callback functions
   *
   * @example
   * ```typescript
   * pubsub.publish('IMAGE_UPLOADED', { url: 'image.jpg', size: 1024 });
   * ```
   */
  publish<T = unknown>(topic: string, data?: T): void {
    if (this.subscribers.has(topic)) {
      this.subscribers.get(topic)!.forEach((callback) => callback(data));
    }
  }

  /**
   * Unsubscribes a callback function from a specific topic.
   *
   * @param topic - The topic to unsubscribe from
   * @param callback - The callback function to be removed
   *
   * @example
   * ```typescript
   * const handler = (data) => console.log(data);
   * pubsub.subscribe('SOME_EVENT', handler);
   * // Later...
   * pubsub.unsubscribe('SOME_EVENT', handler);
   * ```
   */
  unsubscribe<T = unknown>(
    topic: string,
    callback: SubscriberCallback<T>
  ): void {
    if (this.subscribers.has(topic)) {
      this.subscribers.get(topic)!.delete(callback as SubscriberCallback);
    }
  }

  /**
   * Gets the number of subscribers for a specific topic.
   * Useful for debugging and testing.
   *
   * @param topic - The topic to check
   * @returns The number of subscribers for this topic
   */
  getSubscriberCount(topic: string): number {
    return this.subscribers.get(topic)?.size ?? 0;
  }

  /**
   * Clears all subscribers from a specific topic.
   * Useful for cleanup and testing.
   *
   * @param topic - The topic to clear
   */
  clearTopic(topic: string): void {
    this.subscribers.delete(topic);
  }

  /**
   * Clears all subscribers from all topics.
   * Useful for cleanup between tests.
   */
  clearAll(): void {
    this.subscribers.clear();
  }

  /**
   * Gets all registered topic names.
   * Useful for debugging.
   *
   * @returns Array of topic names
   */
  getTopics(): string[] {
    return Array.from(this.subscribers.keys());
  }
}
