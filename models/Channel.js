var deasync  = require('deasync');

module.exports = function(mongoose, Counters) {
  var channelSchema = mongoose.Schema({
    id: {
      type: Number,
      unique: true
    },
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

  channelSchema.pre('save', function(next) {
    var self = this;
    Counters.getNextIndex('channels', true, function(data) {
      self.id = data.index;
      next();
    });
  });

  return mongoose.model('Channel', channelSchema);
};