var deasync      = require('deasync');
var _            = require('lodash');
var async        = require('async');
var request      = require('request');

module.exports = function(Video, Channel, Counters, config, currentDownload) {
  var funcs = {
    getChannelInfo: function(channel) {
      var info = {};
      var done = false;
      request("https://www.googleapis.com/youtube/v3/channels?key=" + config.apikey + "&forUsername=" + channel + "&part=snippet", function (error, response, body) {
        if (!error && response.statusCode == 200) {
          info = JSON.parse(body).items[0];
        } else {
          info = "There was a problem";
        }
        done = true;
      });
      require('deasync').loopWhile(function(){return !done;});
      return info;
    },
    getRecentVids: function(channelName, results) {
      results = results || 5;
      var info = {};
      var done = false;
      var items = [];
      request("https://www.googleapis.com/youtube/v3/channels?key=" + config.apikey + "&forUsername=" + channelName + "&part=contentDetails", function (error, response, body) {
        if (JSON.parse(body).items.length !== 0) {
          request("https://www.googleapis.com/youtube/v3/playlistItems?key=" + config.apikey + "&playlistId=" + JSON.parse(body).items[0].contentDetails.relatedPlaylists.uploads + "&part=snippet", function (error, response, body) {
            info = JSON.parse(body).items;
            info.forEach(item => {
              var obj = {};
              obj.youtubeID = item.snippet.resourceId.videoId;
              obj.published = item.snippet.publishedAt;
              obj.title = item.snippet.title;
              obj.channelTitle = item.snippet.channelTitle;
              obj.channelId = item.snippet.channelId;
              obj.channelName = channelName;
              obj.description = item.snippet.description;
              obj.thumbnail = "http://img.youtube.com/vi/" + obj.youtubeID + "/mqdefault.jpg";
              obj.watched = false;
              items.push(obj);
            });
            done = true;
          });
        } else {
          done = true;
        }
      });
      require('deasync').loopWhile(function(){return !done;});
      return items;
    },
    checkVids: function() {
      var self = this;
      Channel.find({}, function(err, channels) {
        //console.log(channels)
        channels.forEach(channel => {
          var vids = funcs.getRecentVids(channel.channelName, 5);
          async.eachLimit(vids, 1, function(vid, callback) {
            Video.find({youtubeID: vid.youtubeID}, function(err, docs) {
              if (docs.length === 0) {
                Video.create(vid, function(err, doc) {
                  console.log(err, doc);
                  funcs.downloadQueue.push(doc);
                  callback();
                });
              } else {
                //console.log(vid.youtubeID + " has already been detected.");
                callback();
              }
            });
          });
        });
      });
    },
    downloadQueue: async.queue(function(task, callback) {
      try {
        // Update video status to processing
        Video.update({youtubeID: task.youtubeID}, {$set: {processing: true}}, function() {
          var spawn = require('child_process').spawn;
          var ytjob = spawn('youtube-dl', [task.youtubeID, '-f', config.quality, '-o', 'public/vids/%(id)s.%(ext)s']);
          currentDownload.task = task;
          ytjob.stdout.on('data', (data) => {
            //console.log(`stdout: ${data}`);
            try {
              currentDownload.percent = String(data).match(/ \s*(.*)%/)[1];
              currentDownload.total = String(data).match(/of\s(.*) at/)[1];
              currentDownload.rate = String(data).match(/at\s(.*)\/s/)[1];
              currentDownload.eta = String(data).match(/ETA (.*)/)[1];
              console.log(currentDownload.percent);
            } catch(e) {}
          });

          ytjob.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
          });

          ytjob.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            Video.update({youtubeID: task.youtubeID}, {$set: {processing: false, processed: true}}, function() {
              for (var member in currentDownload) delete currentDownload[member];
              callback();
            });
          });
        });
      } catch(e) {
        console.log(task);
      }
    }, config.simultaneousDownloads)
  };

  return funcs;
};
