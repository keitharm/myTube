var config       = require('./config');
var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var compress     = require('compression');
var cors         = require('cors');
var async        = require('async');
var request      = require('request');
var io           = require('socket.io')(config.socket);

var currentDownload = {};

require('./socket')(io, currentDownload);

var db       = require('./models/db')(config);
var Counters = require('./models/Counters')(db);
var Video    = require('./models/Video')(db, Counters);
var Channel  = require('./models/Channel')(db, Counters);

var yt    = require('./yt')(Video, Channel, Counters, config, currentDownload);
var index = require('./routes/index')(Video, Channel, Counters, yt);

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
    res.send(err.message).status(err.status || 500);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.send(err.message).status(err.status || 500);
});

Video.remove({processed: false}, (a, b) => {
  yt.checkVids();
  setInterval(() => {
    request('http://www.google.com', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        yt.checkVids();
      }
    });
  }, config.updateInterval*1000);
});

module.exports = app;
