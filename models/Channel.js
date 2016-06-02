var mongoose = require('mongoose');
var deasync  = require('deasync');

var channelSchema = mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  channelName: {
    type: String,
    unique: true
  }
});

channelSchema.pre('save', function(next) {
  var self = this;
  Counters.getNextIndex('channels', true, function(data) {
    self.id = data.index;
    next();
  });
});

var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;