var express  = require('express');
var fs       = require('fs');
var router   = express.Router();

router.get('/videos', function(req, res, next) {
  Video.find({watched: false}, function(err, docs) {
    res.send(docs);
  });
});

router.post('/watched', function(req, res, next) {
  Video.update({youtubeID: req.body.youtubeID}, {$set: {watched: true}}, function(err, docs) {
    res.sendStatus(200);
  });
});

router.post('/channel', function(req, res, next) {
  if (req.body.channelName === undefined) {
    res.send('Error: missing channelName key').status(400);
  } else {
    Channel.find({channelName: req.body.channelName}, function(err, docs) {
      if (docs.length !== 0) {
        res.send('Error: duplicate channelName').status(422);
      } else {
        Channel.create({channelName: String(req.body.channelName)}, function(err, docs) {
          res.sendStatus(200);
        });
      }
    });
  }
});

router.get('/channel', function(req, res, next) {
  Channel.find({}, function(err, docs) {
    res.send(docs);
  });
});

module.exports = router;