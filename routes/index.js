var express  = require('express');
var fs       = require('fs');
var router   = express.Router();

module.exports = function(Video, Channel, Counters, yt) {
  router.get('/video', function(req, res, next) {
    Video.find({$or:[{processed: true}, {processing: true}]}, {}, {sort: "-published"}, function(err, docs) {
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
          var info = yt.getChannelInfo(req.body.channelName);
          console.log(info);
          Channel.create({channelName: req.body.channelName, channelID: info.id, thumbnail: info.snippet.thumbnails.high.url}, function(err, docs) {
            yt.checkVids();
            res.sendStatus(200);
          });
        }
      });
    }
  });

  router.get('/channel', function(req, res, next) {
    Channel.find({},  {}, {sort: "id"}, function(err, docs) {
      res.send(docs);
    });
  });
  return router;
};
