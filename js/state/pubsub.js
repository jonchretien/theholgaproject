export default class PubSub {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(topic, callback) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic).add(callback);
  }

  publish(topic, data) {
    if (this.subscribers.has(topic)) {
      this.subscribers.get(topic).forEach(callback => callback(data));
    }
  }

  unsubscribe(topic, callback) {
    if (this.subscribers.has(topic)) {
      this.subscribers.get(topic).delete(callback);
    }
  }
}
