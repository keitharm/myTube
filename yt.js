const deasync = require('deasync');
const _       = require('lodash');
const async   = require('async');
const request = require('request');

const utils   = require('./utils');
const config  = utils.config;

let downloaders = utils.get('downloaders');

const Channel = require('./models/Channel');
const Video   = require('./models/Video');

let yt = {
  getVideoInfo,
  getChannelInfo(channelID) {
    let info = {};
    let done = false;

    request("https://www.googleapis.com/youtube/v3/channels?key=" + config.apikey + "&id=" + channelID + "&part=snippet", (error, response, body) => {
      if (!error && response.statusCode == 200) {
        info = JSON.parse(body).items[0];
      } else {
        info = "There was a problem fetching channel info.";
      }
      done = true;
    });

    require('deasync').loopWhile(() => !done);
    return info;
  },
  getRecentVids(channelID, results=5) {
    let info = {};
    let items = [];
    let done = false;

    request("https://www.googleapis.com/youtube/v3/channels?key=" + config.apikey + "&id=" + channelID + "&part=contentDetails", (error, response, body) => {
      if (error) return done = true;

      if (JSON.parse(body).items.length !== 0) {

        request("https://www.googleapis.com/youtube/v3/playlistItems?key=" + config.apikey + "&playlistId=" + JSON.parse(body).items[0].contentDetails.relatedPlaylists.uploads + "&part=snippet&maxResults=" + results, (error, response, body) => {
          try {
            info = JSON.parse(body).items;
          } catch(e) {
            console.log(error, response, body);
            console.log("There was a problem parsing recent vids");
          }

          info.forEach(item => {

            let timeInfo = getVideoInfo(item.snippet.resourceId.videoId);
            let obj = {};

            obj.youtubeID = item.snippet.resourceId.videoId;
            obj.published = item.snippet.publishedAt;
            obj.title = item.snippet.title;
            obj.channelTitle = item.snippet.channelTitle;
            obj.channelId = item.snippet.channelId;
            obj.channelName = item.snippet.channelTitle;
            obj.description = item.snippet.description;
            obj.thumbnail = "http://img.youtube.com/vi/" + obj.youtubeID + "/mqdefault.jpg";
            obj.watched = false;
            obj.time = timeInfo.time;
            obj.currentTime = 0;

            items.push(obj);
          });

          done = true;
        });

      } else {
        done = true;
      }
    });
    require('deasync').loopWhile(() => !done);
    return items;
  },
  checkVids() {
    Channel.find({}, (err, channels) => {
      channels.forEach(channel => {

        let vids = this.getRecentVids(channel.channelID, 10);
        console.log("Checking " + channel.channelName);

        async.eachLimit(vids, 1, (vid, callback) => {
          Video.find({youtubeID: vid.youtubeID}, (err, docs) => {

            if (docs.length === 0) {
              Video.create(vid, (err, doc) => {
                if (err) return callback();

                // Download video if it is older than 15 minutes already
                if ((new Date().getTime() - new Date(doc.published).getTime()) >= 900000) {
                  this.downloadQueue.push(doc);

                } else {
                  setTimeout(() => {
                    this.downloadQueue.push(doc);
                  }, config.downloadDelay * 1000);
                }
                callback();
              });
              console.log(vid.youtubeID + " has been added to download queue", this.downloadQueue.length());

            } else {

              console.log(vid.youtubeID + " has already been detected.");
              callback();
            }
          });
        });
      });
    });
  },
  downloadQueue: async.queue((task, callback) => {
    try {
      // Update video status to processing
      Video.update({youtubeID: task.youtubeID}, {$set: {processing: true}}, () => {

        console.log(`starting download for ${task.youtubeID}`);
        let spawn = require('child_process').spawn;
        let ytjob = spawn('youtube-dl', ['https://www.youtube.com/watch?v=' + task.youtubeID, '-f', config.quality, '-o', 'public/vids/%(id)s.%(ext)s']);
        utils.set('ytjob', ytjob);

        downloaders.task = task;
        ytjob.stdout.on('data', data => {
          try {
            downloaders.percent = String(data).match(/ \s*(.*)%/)[1];
            downloaders.total = String(data).match(/of\s(.*) at/)[1];
            downloaders.rate = String(data).match(/at\s(.*)\/s/)[1];
            downloaders.eta = String(data).match(/ETA (.*)/)[1];
          } catch(e) {}
        });

        ytjob.stderr.on('data', data => {
          console.log(data.toString());
          try {
            if (data.trim() !== "WARNING: Cannot update utime of file") {
              Video.remove({youtubeID: task.youtubeID}, () => {
                console.log(`stderr: ${data}`);
              });
            }
          } catch(e) {}
        });

        ytjob.on('close', code => {
          console.log(`child process exited with code ${code}`);

          if (code !== 0 && code !== null) {
            Video.remove({youtubeID: task.youtubeID}, () => {
              for (let member in downloaders) delete downloaders[member];
              callback();
            });
          } else {
            Video.update({youtubeID: task.youtubeID}, {$set: {processing: false, processed: true}}, function() {
              for (let member in downloaders) delete downloaders[member];
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

function parseDuration(duration) {
  if (duration === undefined) return 0;
  let match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)

  let hours = (parseInt(match[1]) || 0);
  let minutes = (parseInt(match[2]) || 0);
  let seconds = (parseInt(match[3]) || 0);

  return hours * 3600 + minutes * 60 + seconds;
}


function getVideoInfo(videoID) {
  let info = {};
  let vidInfo;
  let done = false;

  request("https://www.googleapis.com/youtube/v3/videos?key=" + config.apikey + "&id=" + videoID + "&part=snippet,contentDetails", function (error, response, body) {
    try {
      JSON.parse(body).items;
    } catch(e) {
      console.log(error, response, body);
      console.log("There was a problem parsing video info");
    }

    info = JSON.parse(body).items;
    info.forEach(item => {
      let obj = {};
      obj.youtubeID = item.id;
      obj.published = item.snippet.publishedAt;
      obj.title = item.snippet.title;
      obj.channelTitle = item.snippet.channelTitle;
      obj.channelId = item.snippet.channelId;
      obj.channelName = item.snippet.channelTitle;
      obj.description = item.snippet.description;
      obj.thumbnail = "http://img.youtube.com/vi/" + obj.youtubeID + "/mqdefault.jpg";
      obj.watched = false;
      obj.time = parseDuration(item.contentDetails.duration),
      obj.currentTime = 0;
      vidInfo = obj;
      });

    done = true;
  });

  require('deasync').loopWhile(() => !done);
  return vidInfo;
}

module.exports = yt;
