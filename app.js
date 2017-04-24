const utils        = require('./utils');
const config       = utils.config;

const express      = require('express');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const compress     = require('compression');
const cors         = require('cors');
const async        = require('async');
const request      = require('request');
const io           = require('socket.io')(config.socket);

// Share sockets and download status utils
utils.set('io', io);

let downloaders = {};
utils.set('downloaders', downloaders);

require('./models/db');
require('./socket');
const Video = require('./models/Video');

const yt    = require('./yt');
const index = require('./routes/index');

const app = express();

app.use(cors());
app.use(compress());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.send(err.message).status(err.status || 500);
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.send(err.message).status(err.status || 500);
});

// Remove all unprocessed videos (maybe add continue feature in the future)
Video.remove({processed: false}, (a, b) => {

  // Check for new videos on start
  yt.checkVids();

  // Make sure that there is internet access before checking for vids
  setInterval(() => {
    request('http://www.google.com', (error, response, body) => {
      if (!error && response.statusCode == 200) {
        yt.checkVids();
      }
    });
  }, config.updateInterval*1000);
});

module.exports = app;
