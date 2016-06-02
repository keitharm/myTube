var mongoose = require('mongoose');
var deasync  = require('deasync');

var channelSchema = mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  youtubeID: {
    type: String,
    unique: true
  },
  name: {
    type: String,
  }
});

channelSchema.pre('save', function(next) {

  Counters.getNextIndex('channels', true, function(data) {
    self.id = data.index;
  });
});

var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;