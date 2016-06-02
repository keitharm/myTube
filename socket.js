var spawn     = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var fs        = require('fs');

module.exports = function(io) {
  io.on('connection', function (socket) {
    socket.on('downloadVid', function (data) {
        var dl = spawn('youtube-dl', [data, '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', '-o', 'public/vids/%(id)s.%(ext)s']);

        dl.stdout.on('data', function(data) {
          var raw = data.toString();
          if (raw.match('ETA') !== null) {
            socket.emit('youtube', {
              status: "downloading",
              msg: {
                percent: raw.match(/\s*(\d+\.\d+)%/)[1],
                size: raw.match(/of\s*(\d+\.\d+.*)\sat/)[1],
                rate: raw.match(/at\s*(\d+.\d+.*\/s)/)[1],
                eta: raw.match(/ETA\s*(.*)/)[1]
              }
            });
          }
        });

        dl.stderr.on('data', function(data) {
          var raw = data.toString();
          if (raw.match('not exist.') !== null) {
            socket.emit('youtube', {
              status: "error",
              msg: "Video does not exist"
            });
          }
        });

        dl.on('close', function(data) {
          socket.emit('youtube', {status: "done"});
        });
    });

    socket.on('lookupVid', function (data) {
      var dl = spawn('youtube-dl', [data, '-F']);

      dl.stdout.on('data', function(result) {
        var raw = result.toString();
        if (raw.match(/Available/) !== null) {
          var filtered = raw.split('\n').filter(function(item) {
            return item.match(/video/);
          }).filter(function(item) {
            return item.match(/mp4/);
          }).map(function(item) {
            return item.match(/(\S*)\s*(\S*)\s*(\S*).*?(\d+fps).*?(\d+\.\d+.*)/).slice(1);
          });

          var info = spawnSync('youtube-dl', [data, '-e', '--get-thumbnail', '--get-id'])['stdout'].toString().split('\n');
          var id = info[1];

          var downloaded = [];
          filtered.forEach(function(video) {
            console.log('./public/vids/' + id + '-' + video[0] + '.mp4');
            if (exists('./public/vids/' + id + '-' + video[0] + '.mp4')) {
              downloaded.push(+video[0]);
            }
          });

          socket.emit('youtube', {
            thumbnail: info[2],
            youtubeID: info[1],
            title: info[0],
            data: filtered,
            downloaded: downloaded
          });
        } else {
          socket.emit('preLookup', raw);
        }
      });

      dl.stderr.on('data', function(data) {
        var raw = data.toString();
        socket.emit('preLookup', "Error, video not found");
        socket.emit('youtube', {thumbnail: "http://i.stack.imgur.com/bJ120.png", title: "video not found", data: []});
      });

      dl.on('close', function(data) {
        //socket.emit('youtube', {status: "done"});
      });
    });

    socket.on('initDownload', function (data) {
      var dl = spawn('youtube-dl', [data.url, '-f', data.id + '+bestaudio[ext=m4a]', '-o', 'public/vids/%(id)s-' + data.id + '.%(ext)s']);

      dl.stdout.on('data', function(data) {
        var raw = data.toString();
        if (raw.match('ETA') !== null) {
          console.log(raw);
          try {
            socket.emit('initDownloadProgress', {
              status: "downloading",
              msg: {
                percent: raw.match(/\s*(\d+\.\d+)%/)[1],
                size: raw.match(/of\s*(\d+\.\d+.*)\sat/)[1],
                rate: raw.match(/at\s*(\d+.\d+.*\/s)/)[1],
                eta: raw.match(/ETA\s*(.*)/)[1]
              }
            });
          } catch(e) {
            socket.emit('initDownloadProgress', {
              status: "downloading",
              msg: {
                percent: null,
                size: null,
                rate: null,
                eta: null
              }
            });
          }
        }
      });

      dl.stderr.on('data', function(data) {
        var raw = data.toString();
        if (raw.match('not exist.') !== null) {
          socket.emit('initDownloadProgress', {
            status: "error",
            msg: "Video does not exist"
          });
        }
      });

      dl.on('close', function(data) {
        socket.emit('initDownloadProgress', {status: "done"});
      });
    });
  });
};

function exists(file) {
  try {
    fs.statSync(file);
  } catch(e) {
    return false;
  }
  return true;
}