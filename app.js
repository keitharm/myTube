var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var compress     = require('compression');
var cors         = require('cors');
var async        = require('async');
var config       = require('./config');
var io           = require('socket.io')(config.socket);
require('./socket')(io);

var index = require('./routes/index');
var db = require('./models/db');

Video    = require('./models/Video');
Channel  = require('./models/Channel');
Counters = require('./models/Counters');

var app = express();

app.use(cors());
app.use(compress());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
currentDownload = {};

setInterval(checkVids, config.updateInterval*1000);

function checkVids() {
  console.log("Performing video check update");
  //queue
}

downloadQueue = async.queue(function(task, callback) {
    callback();
  }
}, config.simultaneousDownloads);

module.exports = app;
