const fs      = require('fs');
const express = require('express');
const router  = express.Router();

const Video   = require('../models/Video');
const Channel = require('../models/Channel');

const utils   = require('../utils');

let downloaders = utils.get('downloaders');

const yt = require('../yt');

router.get('/video', (req, res, next) => {
  Video.find({$and: [{deleted: false}, {$or:[{processed: true}, {processing: true}]}]}, {}, {sort: "-id"}, (err, docs) => {
    res.send(docs);
  });
});

router.post('/video/:id', (req, res, next) => {
  Video.update({youtubeID: req.params.id}, {$set: {currentTime: req.body.currentTime}}, (err, docs) => {
    res.sendStatus(200);
  });
});

router.delete('/video/:id', (req, res, next) => {
  if (downloaders.task && downloaders.task.youtubeID === req.params.id) utils.get('ytjob').kill(); // Kill ffmpeg if video is currently being downloaded

  Video.find({youtubeID: req.params.id}, (err, docs) => {

    if (err) {
      return res.send('Error: video not found').status(400);

    } else {
      try {
        fs.unlinkSync('./public/vids/' + req.params.id + '.mp4');

      } catch(e) {

        require("glob").glob('./public/vids/' + req.params.id + '*.part', (err, files) => {
          files.forEach(file => {
            fs.unlinkSync(file);
          });
        });
      }
      Video.update({youtubeID: req.params.id}, {deleted: true}, (err, docs) => {
        res.sendStatus(200);
      });
    }
  });
});

router.post('/watched', (req, res, next) => {
  Video.update({youtubeID: req.body.youtubeID}, {$set: {watched: true}}, (err, docs) => {
    res.sendStatus(200);
  });
});

router.post('/channel', (req, res, next) => {

  if (req.body.channelID === undefined) {
    res.send('Error: missing channelName key').status(400);

  } else {
    Channel.find({channelID: req.body.channelID}, (err, docs) => {

      if (docs.length !== 0) {
        res.send('Error: duplicate channelID').status(422);

      } else {
        let info = yt.getChannelInfo(req.body.channelID);
        if (info === undefined) {
          res.send('Error: Invalid channel ID').status(400);
        } else {
          Channel.create({channelName: info.snippet.title, channelID: info.id, thumbnail: info.snippet.thumbnails.high.url}, (err, docs) => {
            yt.checkVids();
            res.sendStatus(200);
          });
        }
      }
    });
  }
});

router.post('/manualDownload', (req, res, next) => {
  Video.find({youtubeID: req.body.youtubeID}, (err, result) => {

    if (result.length > 0) {
      Video.remove({youtubeID: req.body.youtubeID}, () => dl());
    } else {
      dl();
    }
  });

  function dl() {
    let vid = yt.getVideoInfo(req.body.youtubeID);

    Video.create(vid, (err, doc) => {
      if (err) return res.send('Error: Invalid video ID');

      yt.downloadQueue.push(doc);

      console.log(vid.youtubeID + " has been manually added to download queue", yt.downloadQueue.length());
      return res.sendStatus(200);
    });
  }
});

router.get('/channel', (req, res, next) => {
  Channel.find({}, {}, {sort: "id"}, (err, docs) => res.send(docs));
});

module.exports = router;
