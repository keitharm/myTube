var VideoPlayer = React.createClass({
  getInitialState: function() {
    return {
      id: "",
      title: "",
      style: {display: "none"},
    }
  },
  showVideo: function(video) {
    var self = this;
    var src = document.getElementById('videoSrc');
    src.src = "/vids/" + video.youtubeID + ".mp4";
    var vid = document.getElementById('video');
    vid.load();
    vid.addEventListener('canplay', function() {
      vid.play();
      this.setState({
        id: video.youtubeID,
        title: video.title,
        style: {display: ""},
      });
    }.bind(this));

    vid.addEventListener('progress', function() {
      var range = 0;
      var bf = this.buffered;
      var time = this.currentTime;

      while(!(bf.start(range) <= time && time <= bf.end(range))) {
          range += 1;
      }
      var loadStartPercentage = bf.start(range) / this.duration;
      var loadEndPercentage = bf.end(range) / this.duration;
      var loadPercentage = loadEndPercentage - loadStartPercentage;
      self.setState({
        loadedPercent: (Math.round(loadPercentage*10000)/100).toFixed(2) + "%"
      });
    });

  },
  componentDidMount: function() {
    var video = document.getElementById('video');
    video.onclick = function(e) {
      console.log('blah');
      e.stopPropagation();
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
    document.onkeypress = function(evt) {
      if (document.activeElement.id !== "channel") {
        evt = evt || window.event;
        var charCode = evt.keyCode || evt.which;
        var charStr = String.fromCharCode(charCode);
        if (charCode >= 49 && charCode <= 57) {
          video.currentTime = ~~(video.duration*((charCode-48)/10));
        // 0 reset to start of video
        } else if (charCode === 48) {
          video.currentTime = 0;
        } else if (charCode === 102) {
          if (video.requestFullscreen) {
            video.requestFullscreen();
          } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
          } else if (video.mozRequestFullScreen) {
            video.mozRequestFullScreen();
          } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
          }
        // Space bar
        } else if (charCode === 32) {
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
        }

        // Hack to make controls show up when you manipulate time
        video.controls = false;
        video.controls = true;
      }
    }.bind(this);

    document.onkeydown = function(evt) {
      evt = evt || window.event;
      var isEscape = false;
      if ("key" in evt) {
          isEscape = evt.key == "Escape";
      } else {
          isEscape = evt.keyCode == 27;
      }
      if (isEscape) {
        this.hideVideo()
      }
      if (evt.shiftKey) {
        if (evt.keyCode === 37) {
          video.currentTime -= 10;
        } else if (evt.keyCode === 39) {
          video.currentTime += 10;
        }
      } else {
        if (evt.keyCode === 37) {
          video.currentTime -= 5;
        } else if (evt.keyCode === 39) {
          video.currentTime += 5;
        }
      }

      // Hack to make controls show up when you manipulate time
      video.controls = false;
      video.controls = true;
    }.bind(this);
  },
  hideVideo: function() {
    this.setState({style: {display: "none"}});
    video.pause();
  },
  render: function() {
    return (
      <div id="modal" style={this.state.style} onClick={this.hideVideo} className="modalbg">
        <div className="videoPlayer">
          <h1 className="videoTitle">{this.state.title}</h1>
          <p className="videoTitle">Loaded {this.state.loadedPercent}</p>
          <div className="videoPanel">
          </div>
          <video id='video' controls preload="metadata" width="800" height="450">
            <source id='videoSrc' src={"vids/" + this.state.id + ".mp4"} type="video/mp4" />
            <p>Please use a modern browser to view this video.</p>
          </video>
        </div>
      </div>
    );
  }
});

module.exports = VideoPlayer;
