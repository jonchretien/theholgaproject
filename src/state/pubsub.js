/**
 * PubSub class for managing publish-subscribe pattern.
 */
export default class PubSub {
  /**
   * Creates an instance of PubSub.
   */
  constructor() {
    this.subscribers = new Map();
  }

  /**
   * Subscribes a callback function to a specific topic.
   *
   * @param {string} topic - The topic to subscribe to.
   * @param {Function} callback - The callback function to be called when the topic is published.
   */
  subscribe(topic, callback) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic).add(callback);
  }

  /**
   * Publishes data to a specific topic, invoking all subscribed callbacks.
   *
   * @param {string} topic - The topic to publish to.
   * @param {*} data - The data to be passed to the callback functions.
   */
  publish(topic, data) {
    if (this.subscribers.has(topic)) {
      this.subscribers.get(topic).forEach(callback => callback(data));
    }
  }

  /**
   * Unsubscribes a callback function from a specific topic.
   *
   * @param {string} topic - The topic to unsubscribe from.
   * @param {Function} callback - The callback function to be removed.
   */
  unsubscribe(topic, callback) {
    if (this.subscribers.has(topic)) {
      this.subscribers.get(topic).delete(callback);
    }
  }
}
