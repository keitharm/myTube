var express  = require('express');
var fs       = require('fs');
var router   = express.Router();

module.exports = function(Video, Channel, Counters, yt) {
  router.get('/video', function(req, res, next) {
    Video.find({$and: [{deleted: false}, {$or:[{processed: true}, {processing: true}]}]}, {}, {sort: "-id"}, function(err, docs) {
      res.send(docs);
    });
  });

  router.delete('/video/:id', function(req, res, next) {
    Video.find({youtubeID: req.params.id}, function(err, docs) {
      if (err) {
        res.send('Error: video not found').status(400);
        return;
      } else {
        try {
          fs.unlinkSync('./public/vids/' + req.params.id + '.mp4');
        } catch(e) {
          require("glob").glob('./public/vids/' + req.params.id + '*.part', function (er, files) {
            files.forEach(file => {
              fs.unlinkSync(file);
            });
          });
        }
        Video.update({youtubeID: req.params.id}, {deleted: true}, function(err, docs) {
          res.sendStatus(200);
        });
      }
    });
  });

  router.post('/watched', function(req, res, next) {
    Video.update({youtubeID: req.body.youtubeID}, {$set: {watched: true}}, function(err, docs) {
      res.sendStatus(200);
    });
  });

  router.post('/channel', function(req, res, next) {
    if (req.body.channelID === undefined) {
      res.send('Error: missing channelName key').status(400);
    } else {
      Channel.find({channelID: req.body.channelID}, function(err, docs) {
        if (docs.length !== 0) {
          res.send('Error: duplicate channelID').status(422);
        } else {
          var info = yt.getChannelInfo(req.body.channelID);
          if (info === undefined) {
            res.send('Error: Invalid channel ID').status(400);
          } else {
            Channel.create({channelName: info.snippet.title, channelID: info.id, thumbnail: info.snippet.thumbnails.high.url}, function(err, docs) {
              yt.checkVids();
              res.sendStatus(200);
            });
          }
        }
      });
    }
  });

  router.post('/manualDownload', function(req, res, next) {
    Video.find({youtubeID: req.body.youtubeID}, (err, result) => {
      if (result.length > 0) {
        Video.remove({youtubeID: req.body.youtubeID}, () => {
          dl();
        });
      } else {
        dl();
      }
    });
    function dl() {
      var vid = yt.getVideoInfo(req.body.youtubeID);
      Video.create(vid, function(err, doc) {
        if (err) return res.send('Error: Invalid video ID');

        yt.downloadQueue.push(doc);
        console.log(vid.youtubeID + " has been manually added to download queue", yt.downloadQueue.length());
        return res.sendStatus(200);
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
