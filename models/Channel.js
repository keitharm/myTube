const deasync  = require('deasync');
const mongoose = require('mongoose');

let channelSchema = mongoose.Schema({
  channelName: {
    type: String,
    unique: true
  },
  channelID: {
    type: String,
    unique: true
  },
  thumbnail: {
    type: String
  }
});

module.exports =  mongoose.model('Channel', channelSchema);
