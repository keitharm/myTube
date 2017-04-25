const fs        = require('fs');
const spawn     = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;

const utils = require('./utils');

let io = utils.get('io');
let downloaders = utils.get('downloaders');

io.on('connection', socket => {
  let oldID = null;

  setInterval(() => {
    if (Object.keys(downloaders).length !== 0 && downloaders.percent !== undefined) {
      if (oldID !== downloaders.task.youtubeID) {
        io.emit('downloadStart', null);
        oldID = downloaders.task.youtubeID
      }
      io.emit('download', downloaders);
    }
  }, 1000);

  socket.on('downloadVid', data => {
      let dl = spawn('youtube-dl', [data, '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', '-o', 'public/vids/%(id)s.%(ext)s']);

      dl.stdout.on('data', data => {

        let raw = data.toString();
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

      dl.stderr.on('data', data => {

        let raw = data.toString();
        if (raw.match('not exist.') !== null) {
          socket.emit('youtube', {
            status: "error",
            msg: "Video does not exist"
          });
        }
      });

      dl.on('close', data => {
        socket.emit('youtube', {status: "done"});
      });
  });

  socket.on('lookupVid', data => {
    let dl = spawn('youtube-dl', [data, '-F']);

    dl.stdout.on('data', result => {

      let raw = result.toString();

      if (raw.match(/Available/) !== null) {
        let filtered = raw
          .split('\n')
          .filter(item => item.match(/video/))
          .filter(item => item.match(/mp4/))
          .map(item => {
            return item
              .match(/(\S*)\s*(\S*)\s*(\S*).*?(\d+fps).*?(\d+\.\d+.*)/)
              .slice(1);
          });

        let info = spawnSync('youtube-dl', [data, '-e', '--get-thumbnail', '--get-id'])['stdout'].toString().split('\n');
        let id = info[1];

        let downloaded = [];
        filtered.forEach(video => {
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

    dl.stderr.on('data', data => {
      let raw = data.toString();
      socket.emit('preLookup', "Error, video not found");
      socket.emit('youtube', {thumbnail: "http://i.stack.imgur.com/bJ120.png", title: "video not found", data: []});
    });

    dl.on('close', data => {
      //socket.emit('youtube', {status: "done"});
    });
  });

  socket.on('initDownload', data => {
    let dl = spawn('youtube-dl', [data.url, '-f', data.id + '+bestaudio[ext=m4a]', '-o', 'public/vids/%(id)s-' + data.id + '.%(ext)s']);

    dl.stdout.on('data', data => {

      let raw = data.toString();
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

    dl.stderr.on('data', data => {

      let raw = data.toString();
      if (raw.match('not exist.') !== null) {
        socket.emit('initDownloadProgress', {
          status: "error",
          msg: "Video does not exist"
        });
      }
    });

    dl.on('close', data => socket.emit('initDownloadProgress', {status: "done"}));
  });
});

function exists(file) {
  try {
    fs.statSync(file);
  } catch(e) {
    return false;
  }
  return true;
}
