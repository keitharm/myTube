var mongoose = require('mongoose');

module.exports = function(settings) {
  var options = {
    user: settings.db.username,
    pass: settings.db.password
  };

  mongoose.connect('mongodb://' + settings.db.host + '/' + settings.db.database, options);
  var conn = mongoose.connection;

  conn.on('error', console.error.bind(console, 'connection error:'));

  return mongoose;
};