var VideoTile = require('./VideoTile')
var SubscriptionBox = React.createClass({
  getInitialState: function() {
    return {
      videos: [],
      socket: this.props.socket,
      updateStatus: this.props.updateStatus,
      selected: "",
      selectedVideos: []
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
    }.bind(this));
  },

  componentDidMount: function() {
    this.requestVideos();
    this.state.socket.on('downloadStart', function() {
      this.requestVideos();
    }.bind(this));
    this.state.socket.on('download', function(data) {
      console.log(data);
      if (data.percent !== undefined) {
        this.state.updateStatus("Downloading " + data.task.title.slice(0, 25) + "... | " + data.percent + "% of " + data.total + " @ " + data.rate + "/s | ETA: " + data.eta);
      }
    }.bind(this));
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
              ref={'item' + i}
              deleteVideo={this.props.deleteVideo}
            />
          );
        }, this)}
      </div>
    )
  }
});

module.exports = SubscriptionBox;
