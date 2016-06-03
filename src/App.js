var SubscriptionBox = require('./Components/SubscriptionBox');
var ChannelBox = require('./Components/ChannelBox');
var VideoPlayer = require('./Components/VideoPlayer');
var config = require('../config.json');
var keyMirror = require('keyMirror');

var App = React.createClass({
  addChannel: function(e) {
    e.preventDefault();
    if (this.state.channelText !== "") {
      $.post('/api/channel', {channelName: this.state.channelText}, function(result) {
        if (result === "OK") {
          this.updateStatus("Channel " + this.state.channelText + " was added successfully!");
        } else {
          this.updateStatus(result);
        }
        this.setState({channelText: ""});
      }.bind(this));
    }
  },
  viewVideo: function(e) {
    this.setState({currentVideo: e, playVideo: true});
    if (this.refs.videoPlayer !== undefined) {
      this.refs.videoPlayer.showVideo(this.refs.SubscriptionBox.state.videos[e].youtubeID);
      console.log(this.refs.SubscriptionBox.state.videos);
    }
  },
  updateStatus: function(txt) {
    clearInterval(this.state.statusTimeout);
    this.setState({
      status: txt,
      statusTimeout: setTimeout(function() {
        this.setState({status: "ready"});
      }.bind(this), 2500)
    });
  },
  updateChannelText: function(e) {
    this.setState({channelText: e.target.value});
  },
  getInitialState: function() {
    return {
      status: "ready",
      channelText: "",
      currentVideo: {},
      showModal: false,
      playVideo: false
    };
  },
  componentWillMount: function() {
    this.setState({socket: io.connect(":" + config.socket)});
  },
  componentDidMount: function() {
  },
  currentVideo: function() {
    return this.state.currentVideo;
  },
  render: function() {
    if (this.state.playVideo) {
      videoPlayer = <VideoPlayer ref="videoPlayer" getCurrentVid={this.currentVideo} />
    } else {
      videoPlayer = "";
    }

    return (
      <div className="app container-fluid">
        {videoPlayer}
        <div className="row header">
          <div className="col-xs-2 col-md-1"><a href="/">myTube</a></div>
          <div className="col-xs-5 col-md-8 status">Status: <span id="statusText">{this.state.status}</span></div>
          <div className="col-xs-1 col-md-1 status"><form onSubmit={this.addChannel}><input type="text" id="channel" name="channel" placeholder="Add Channel" value={this.state.channelText} onChange={this.updateChannelText} autoComplete="off" /></form></div>
        </div>
        <div className="row myTube">
          <span className="title">Subscriptions</span>
          <div className="container-fluid">
            <SubscriptionBox socket={this.state.socket} ref="SubscriptionBox" updateStatus={this.updateStatus} viewVideo={this.viewVideo} />
          </div>
          <span className="title">Channels</span>
          <div className="container-fluid">
            <ChannelBox socket={this.state.socket} updateStatus={this.updateStatus} />
          </div>
        </div>
      </div>
    )
  }
});

ReactDOM.render(<App />, document.getElementById('app'));
