const PubSub = {
  events: {},

  /**
   * Sets up subscription by creating a new event
   * or adding a callback to the existing collection.
   * @param {String} event
   * @param {Function} callback
   */
  subscribe(event, callback) {
    // create the event if not yet created
    if (!this.events.hasOwnProperty(event)) {
      this.events[event] = [];
    }

    // add the callback
    return this.events[event].push(callback);
  },

  /**
   * Loops through each event and triggers callbacks
   * if they exist.
   * @param {String} event
   * @param {Object} data
   */
  publish(event, data = {}) {
    // return if the event doesn't exist, or there are no callbacks
    if (!this.events.hasOwnProperty(event) || this.events[event].length < 1)
      return;

    // send the event to all callbacks
    return this.events[event].map(callback => callback(data));
  },

  /**
   * Removes event.
   * @param {String} event
   */
  unsubscribe(event) {
    if (!this.events.hasOwnProperty(event)) return;
    const idx = this.event.indexOf(event);
    return this.events.splice(idx);
  },
};

export default PubSub;
