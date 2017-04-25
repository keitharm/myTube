var VideoTile = require('./VideoTile')
var SubscriptionBox = React.createClass({
  getInitialState: function() {
    return {
      videos: [],
      socket: this.props.socket,
      updateStatus: this.props.updateStatus,
      updateTimeStats: this.props.updateTimeStats,
      selected: "",
      selectedVideos: [],
      mode: "socket"
    };
  },

  vidClick: function(index) {
    // $.post('/api/watched', {youtubeID: this.refs['item' + index].props.id}, function () {
    //   var self = this;
    //   this.setState({videos: this.state.videos.filter(item => item.youtubeID !== self.refs['item' + index].props.id)});
    // }.bind(this));
    
    this.props.viewVideo(index);
  },

  authorClick: function(index) {
    console.log('Author: ' + this.refs['item' + index]);
  },

  requestVideos: function() {
    $.get('api/video', function (videos) {
      this.setState({
        videos,
        selectedVideos: videos
      });
      let totalTime = Math.floor(videos.reduce((a, b) => a + b.time, 0));
      let watchTime = Math.floor(videos.reduce((a, b) => a + b.currentTime, 0));

      let cTotalTime = conv(totalTime);
      let cWatchTime = conv(watchTime);

      this.state.updateTimeStats(`Watched ${cWatchTime.days}d ${cWatchTime.hours}h ${cWatchTime.minutes}m ${cWatchTime.seconds}s of ${cTotalTime.days}d ${cTotalTime.hours}h ${cTotalTime.minutes}m ${cTotalTime.seconds}s (${Math.floor((watchTime/totalTime)*10000)/10000}%)`)
    }.bind(this));
  },

  componentDidMount: function() {
    let self = this;
    this.requestVideos();
    let times = 0;

    let socketCheck = setInterval(() => {
      if (this.state.socket.connected) {
        console.log("Mode will be kept on socket");
        startDownloadListener();
      }
      if (times++ === 3) {
        this.setState({mode: "http"});
        console.log("setting mode to http");
        startDownloadListener();
      }
    }, 1000);

    function startDownloadListener() {
      clearInterval(socketCheck);

      if (self.state.mode === "socket") {
        self.state.socket.on('downloadStart', function() {
          self.requestVideos();
        }.bind(self));
        self.state.socket.on('download', function(data) {
          console.log(data);
          if (data.percent !== undefined) {
            self.state.updateStatus("Downloading " + data.task.title.slice(0, 15) + "... | " + data.percent + "% of " + data.total + " @ " + data.rate + "/s | ETA: " + data.eta);
          }
        }.bind(self));

      // http
      } else {
        let alreadyRequested = false;
        setInterval(() => {
          $.get("api/downloadStatus", data => {

            // Video is downloading
            if (alreadyRequested && Object.keys(data).length !== 0) {
              //alreadyRequested = true;
            } else {
              alreadyRequested = false;
            }

            console.log(data);
            if (data.percent !== undefined) {
              if (!alreadyRequested) self.requestVideos();
              alreadyRequested = true;
              self.state.updateStatus("Downloading " + data.task.title.slice(0, 15) + "... | " + data.percent + "% of " + data.total + " @ " + data.rate + "/s | ETA: " + data.eta);
            }
          });
        }, 500);
      }
    }
  },

  render: function() {
    return (
      <div className="subscriptionBox">
        {this.state.videos.filter(item => {
          if (this.state.selected === "") {
            return true;
          } else {
            return this.state.selected === item.channelName;
          }
        }).map(function(item, i) {
          return (
            <VideoTile
              vidClick={this.vidClick.bind(this, item.youtubeID)}
              authorClick={this.authorClick.bind(this, i)}
              key={i}
              title={item.title.slice(0, 40) + "..."}
              thumb={item.thumbnail}
              channelName={item.channelName}
              info={item.info}
              id={item.youtubeID}
              time={item.time}
              currentTime={item.currentTime}
              ref={'item' + i}
              deleteVideo={this.props.deleteVideo}
            />
          );
        }, this)}
      </div>
    )
  }
});

function conv(sec) {
  var dateFuture = new Date(Date.now() + sec*1000);
  var dateNow = new Date();

  var seconds = Math.floor((dateFuture - (dateNow))/1000);
  var minutes = Math.floor(seconds/60);
  var hours = Math.floor(minutes/60);
  var days = Math.floor(hours/24);

  hours = hours-(days*24);
  minutes = minutes-(days*24*60)-(hours*60);
  seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
  return {days, hours, minutes, seconds};
}

module.exports = SubscriptionBox;
