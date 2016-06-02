var settings = require('../config.json');
var mongoose = require('mongoose');

var options = {
  user: settings.db.username,
  pass: settings.db.password
};

mongoose.connect('mongodb://' + settings.db.host + '/' + settings.db.database, options);
var conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));
