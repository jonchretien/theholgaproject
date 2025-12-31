/**
 * Unit tests for PubSub class
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PubSub from './pubsub';

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

  describe('Helper methods', () => {
    describe('getSubscriberCount', () => {
      it('should return 0 for non-existent topic', () => {
        expect(pubsub.getSubscriberCount('non-existent')).toBe(0);
      });

      it('should return correct count for topic with subscribers', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        pubsub.subscribe('test-topic', callback1);
        pubsub.subscribe('test-topic', callback2);

        expect(pubsub.getSubscriberCount('test-topic')).toBe(2);
      });

      it('should return 1 when same callback subscribed twice (Set behavior)', () => {
        const callback = vi.fn();

        pubsub.subscribe('test-topic', callback);
        pubsub.subscribe('test-topic', callback);

        expect(pubsub.getSubscriberCount('test-topic')).toBe(1);
      });
    });

    describe('clearTopic', () => {
      it('should remove all subscribers from a topic', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        pubsub.subscribe('test-topic', callback1);
        pubsub.subscribe('test-topic', callback2);

        pubsub.clearTopic('test-topic');

        pubsub.publish('test-topic', 'data');

        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).not.toHaveBeenCalled();
        expect(pubsub.getSubscriberCount('test-topic')).toBe(0);
      });

      it('should not throw for non-existent topic', () => {
        expect(() => {
          pubsub.clearTopic('non-existent');
        }).not.toThrow();
      });
    });

    describe('clearAll', () => {
      it('should remove all subscribers from all topics', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        pubsub.subscribe('topic-1', callback1);
        pubsub.subscribe('topic-2', callback2);

        pubsub.clearAll();

        pubsub.publish('topic-1', 'data');
        pubsub.publish('topic-2', 'data');

        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).not.toHaveBeenCalled();
        expect(pubsub.getTopics()).toHaveLength(0);
      });
    });

    describe('getTopics', () => {
      it('should return empty array when no topics', () => {
        expect(pubsub.getTopics()).toEqual([]);
      });

      it('should return array of topic names', () => {
        pubsub.subscribe('topic-1', vi.fn());
        pubsub.subscribe('topic-2', vi.fn());
        pubsub.subscribe('topic-3', vi.fn());

        const topics = pubsub.getTopics();

        expect(topics).toHaveLength(3);
        expect(topics).toContain('topic-1');
        expect(topics).toContain('topic-2');
        expect(topics).toContain('topic-3');
      });
    });
  });
});
