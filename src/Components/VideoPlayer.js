var VideoPlayer = React.createClass({
  getInitialState: function() {
    console.log(this.props.getCurrentVid());
    return {
      id: "2AzFd3KdHCI",
      title: "",
      style: {display: ""},
    }
  },
  showVideo: function(id) {
    var src = document.getElementById('videoSrc');
    src.src = "/vids/" + id + ".mp4";
    var vid = document.getElementById('video');
    vid.load();
    vid.addEventListener('canplay', function() {
      this.setState({
        id: id,
        title: "",
        style: {display: ""},
      });
    }.bind(this));

  },
  componentDidMount: function() {
    var video = document.getElementById('video');
    document.onkeypress = function(evt) {
      if (document.activeElement.id !== "channel") {
        evt.preventDefault();
        evt = evt || window.event;
        var charCode = evt.keyCode || evt.which;
        var charStr = String.fromCharCode(charCode);
        if (charCode >= 49 && charCode <= 57) {
          video.currentTime += Math.abs(48-charCode);
        } else if (charCode === 48) {
          video.currentTime += 10;
        } else if (charCode >= 33 && charCode <= 36 && charCode != 34) {
          video.currentTime -= Math.abs(32-charCode);
        } else if (charCode === 64) {
          video.currentTime -= 2
        } else if (charCode === 37) {
          video.currentTime -= 5;
        } else if (charCode === 94) {
          video.currentTime -= 6;
        } else if (charCode === 38) {
          video.currentTime -= 7
        } else if (charCode === 42) {
          video.currentTime -= 8
        } else if (charCode === 40) {
          video.currentTime -= 9
        } else if (charCode === 41) {
          video.currentTime -= 10
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
        } else if (charCode === 32) {
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
        }
        video.controls = false;
        video.controls = true;
      }
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
          <video id='video' controls preload="metadata" width="800" height="600" poster="http://img.youtube.com/vi/bSEXPzkO3J4/mqdefault.jpg">
            <source id='videoSrc' src={"vids/" + this.state.id + ".mp4"} type="video/mp4" />
            <p>Please use a modern browser to view this video.</p>
          </video>
        </div>
      </div>
    );
  }
});

module.exports = VideoPlayer;
