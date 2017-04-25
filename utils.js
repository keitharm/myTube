const fs           = require('fs');
const EventEmitter = require('events').EventEmitter;

const config = require('./config.json');

let store = {};
let ee    = new EventEmitter();

module.exports = {
  config,
  set(key, value) {
    store[key] = value;
  },
  get(key) {
    return store[key];
  },
  on(eventName, cb) {
    ee.on(eventName, cb);
  },
  once(eventName, cb) {
    ee.once(eventName, cb);
  },
  emit(eventName, data) {
    ee.emit(eventName, data);
  }
};
