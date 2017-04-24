const deasync = require('deasync');
const mongoose = require('mongoose');

let videoSchema = mongoose.Schema({
  youtubeID: {
    type: String,
    unique: true
  },
  published: {
    type: Date
  },
  time: {
    type: Number,
    default: 0
  },
  currentTime: {
    type: Number,
    default: 0
  },
  channelTitle: {
    type: "String"
  },
  channelId: {
    type: "String"
  },
  channelName: {
    type: "String"
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  thumbnail: {
    type: String
  },
  deleted: {
    type: Boolean,
    default: false
  },
  processing: {
    type: Boolean,
    default: false
  },
  processed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Video', videoSchema);
