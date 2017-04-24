const mongoose = require('mongoose');
const settings = require('../utils').config;

let options = {
  user: settings.db.username,
  pass: settings.db.password
};

mongoose.connect('mongodb://' + settings.db.host + '/' + settings.db.database, options);
let conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

module.exports = mongoose;
