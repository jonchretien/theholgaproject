/**
 * Unit tests for PubSub class
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PubSub from './pubsub.js';

describe('PubSub', () => {
  let pubsub: InstanceType<typeof PubSub>;

  beforeEach(() => {
    pubsub = new PubSub();
  });

  describe('subscribe', () => {
    it('should add a subscriber to a topic', () => {
      const callback = vi.fn();
      pubsub.subscribe('test-topic', callback);

      pubsub.publish('test-topic', 'test-data');

      expect(callback).toHaveBeenCalledWith('test-data');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple subscribers to the same topic', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      pubsub.subscribe('test-topic', callback1);
      pubsub.subscribe('test-topic', callback2);

      pubsub.publish('test-topic', 'test-data');

      expect(callback1).toHaveBeenCalledWith('test-data');
      expect(callback2).toHaveBeenCalledWith('test-data');
    });

    it('should not add the same callback twice for the same topic', () => {
      const callback = vi.fn();

      pubsub.subscribe('test-topic', callback);
      pubsub.subscribe('test-topic', callback);

      pubsub.publish('test-topic', 'test-data');

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('publish', () => {
    it('should not throw if topic has no subscribers', () => {
      expect(() => {
        pubsub.publish('non-existent-topic', 'test-data');
      }).not.toThrow();
    });

    it('should pass data to all subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const testData = { value: 42 };

      pubsub.subscribe('test-topic', callback1);
      pubsub.subscribe('test-topic', callback2);

      pubsub.publish('test-topic', testData);

      expect(callback1).toHaveBeenCalledWith(testData);
      expect(callback2).toHaveBeenCalledWith(testData);
    });
  });

  describe('unsubscribe', () => {
    it('should remove a subscriber from a topic', () => {
      const callback = vi.fn();

      pubsub.subscribe('test-topic', callback);
      pubsub.unsubscribe('test-topic', callback);

      pubsub.publish('test-topic', 'test-data');

      expect(callback).not.toHaveBeenCalled();
    });

    it('should not affect other subscribers when unsubscribing', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      pubsub.subscribe('test-topic', callback1);
      pubsub.subscribe('test-topic', callback2);

      pubsub.unsubscribe('test-topic', callback1);
      pubsub.publish('test-topic', 'test-data');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('test-data');
    });

    it('should not throw if topic does not exist', () => {
      const callback = vi.fn();

      expect(() => {
        pubsub.unsubscribe('non-existent-topic', callback);
      }).not.toThrow();
    });

    it('should not throw if callback is not subscribed', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      pubsub.subscribe('test-topic', callback1);

      expect(() => {
        pubsub.unsubscribe('test-topic', callback2);
      }).not.toThrow();
    });
  });
});
