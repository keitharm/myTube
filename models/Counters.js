var findOrCreate = require('mongoose-findorcreate')

module.exports = function(mongoose) {
  var CountersSchema = mongoose.Schema({
    name: String,
    index: Number
  });

  CountersSchema.plugin(findOrCreate);
  var Counters = mongoose.model('Counters', CountersSchema);

  Counters.getNextIndex = function(name, increment, cb) {
    if (increment === undefined) increment = false;

    Counters.findOrCreate({name: name}, {name: name, index: 1}, (err, obj, created) => {
      // Update record
      if (!created && increment) {
        Counters.update({name: name}, {$inc: {index: 1}}, (err) => {
          obj.index++;
          cb(obj);
        });
      } else {
        cb(obj);
      }
    });
  };

  return Counters;
};
