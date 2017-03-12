var deasync      = require('deasync');
var _            = require('lodash');
var async        = require('async');
var request      = require('request');

module.exports = function(Video, Channel, Counters, config, currentDownload) {
  var funcs = {
    getVideoInfo: function(videoID) {
      var info = {};
      var vidInfo;
      var done = false;
      request("https://www.googleapis.com/youtube/v3/videos?key=" + config.apikey + "&id=" + videoID + "&part=snippet", function (error, response, body) {
        // Hack to catch random errors
        try {
          JSON.parse(body).items;
        } catch(e) {
          console.log(error, response, body);
        }
        info = JSON.parse(body).items;
        info.forEach(item => {
          var obj = {};
          obj.youtubeID = item.id;
          obj.published = item.snippet.publishedAt;
          obj.title = item.snippet.title;
          obj.channelTitle = item.snippet.channelTitle;
          obj.channelId = item.snippet.channelId;
          obj.channelName = item.snippet.channelTitle;
          obj.description = item.snippet.description;
          obj.thumbnail = "http://img.youtube.com/vi/" + obj.youtubeID + "/mqdefault.jpg";
          obj.watched = false;
          vidInfo = obj;
        });
        done = true;
      });
      require('deasync').loopWhile(function(){return !done;});
      return vidInfo;
    },
    getChannelInfo: function(channelID) {
      var info = {};
      var done = false;
      request("https://www.googleapis.com/youtube/v3/channels?key=" + config.apikey + "&id=" + channelID + "&part=snippet", function (error, response, body) {
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
    getRecentVids: function(channelID, results) {
      results || 5;
      var info = {};
      var done = false;
      var items = [];
      request("https://www.googleapis.com/youtube/v3/channels?key=" + config.apikey + "&id=" + channelID + "&part=contentDetails", function (error, response, body) {
        if (error) {
          done = true;
          return;
        }
        if (JSON.parse(body).items.length !== 0) {
          request("https://www.googleapis.com/youtube/v3/playlistItems?key=" + config.apikey + "&playlistId=" + JSON.parse(body).items[0].contentDetails.relatedPlaylists.uploads + "&part=snippet&maxResults=" + results, function (error, response, body) {
            // Hack to catch random errors
            try {
              JSON.parse(body).items;
            } catch(e) {
              console.log(error, response, body);
            }
            info = JSON.parse(body).items;
            info.forEach(item => {
              var obj = {};
              obj.youtubeID = item.snippet.resourceId.videoId;
              obj.published = item.snippet.publishedAt;
              obj.title = item.snippet.title;
              obj.channelTitle = item.snippet.channelTitle;
              obj.channelId = item.snippet.channelId;
              obj.channelName = item.snippet.channelTitle;
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
        channels.forEach(channel => {
          console.log("Checking " + channel.channelName);
          var vids = funcs.getRecentVids(channel.channelID, 10);
          async.eachLimit(vids, 1, function(vid, callback) {
            Video.find({youtubeID: vid.youtubeID}, function(err, docs) {
              if (docs.length === 0) {
                Video.create(vid, function(err, doc) {
                  if (err) return callback();
                  // Download video if it is older than 15 minutes already
                  if ((new Date().getTime() - new Date(doc.published).getTime()) >= 900000) {
                    funcs.downloadQueue.push(doc);
                  } else {
                    setTimeout(function() {
                      funcs.downloadQueue.push(doc);
                    }, config.downloadDelay * 1000);
                  }
                  callback();
                });
                console.log(vid.youtubeID + " has been added to download queue", funcs.downloadQueue.length());
              } else {
                console.log(vid.youtubeID + " has already been detected.");
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
          var ytjob = spawn('youtube-dl', ['https://www.youtube.com/watch?v=' + task.youtubeID, '-f', config.quality, '-o', 'public/vids/%(id)s.%(ext)s']);
          console.log(`starting download for ${task.youtubeID}`);
          currentDownload.task = task;
          ytjob.stdout.on('data', (data) => {
            //console.log(`stdout: ${data}`);
            try {
              currentDownload.percent = String(data).match(/ \s*(.*)%/)[1];
              currentDownload.total = String(data).match(/of\s(.*) at/)[1];
              currentDownload.rate = String(data).match(/at\s(.*)\/s/)[1];
              currentDownload.eta = String(data).match(/ETA (.*)/)[1];
            } catch(e) {}
          });

          ytjob.stderr.on('data', (data) => {
            try {
              if (data.trim() !== "WARNING: Cannot update utime of file") {
                Video.remove({youtubeID: task.youtubeID}, () => {
                  console.log(`stderr: ${data}`);
                });
              }
            } catch(e) {}
          });

          ytjob.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            if (code !== 0) {
              Video.remove({youtubeID: task.youtubeID}, () => {
                for (var member in currentDownload) delete currentDownload[member];
                callback();
              });
            } else {
              Video.update({youtubeID: task.youtubeID}, {$set: {processing: false, processed: true}}, function() {
                for (var member in currentDownload) delete currentDownload[member];
                callback();
              });
            }
          });
        });
      } catch(e) {
        console.log(`something bad happened for ${task.youtubeID}`);
      }
    }, config.simultaneousDownloads)
  };

  return funcs;
};
