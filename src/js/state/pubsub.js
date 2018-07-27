const PubSub = {
  events: {},

  subscribe(event, callback) {
    // create the event if not yet created
    if (!this.events.hasOwnProperty(event)) {
      this.events[event] = [];
    }

    // add the callback
    return this.events[event].push(callback);
  },

  publish(event, data = {}) {
    // return if the event doesn't exist, or there are no callbacks
    if (!this.events.hasOwnProperty(event) || this.events[event].length < 1)
      return;

    // send the event to all callbacks
    return this.events[event].map(callback => callback(data));
  },

  unsubscribe(event) {
    if (!this.events.hasOwnProperty(event)) return;
    const idx = this.event.indexOf(event);
    return this.events.splice(idx);
  },
};

export default PubSub;
