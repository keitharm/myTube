var ChannelTile = require('./ChannelTile')
var ChannelBox = React.createClass({
  getInitialState: function() {
    return {
      channels: [],
      socket: this.props.socket,
      updateStatus: this.props.updateStatus
    };
  },

  authorClick: function(index) {
    console.log('Author: ' + this.refs['item' + index]);
  },

  requestChannels: function() {
    this.serverRequest = $.get('/api/channel', function (channels) {
      this.setState({
        channels
      });
    }.bind(this));
  },

  componentDidMount: function() {
    this.requestChannels();
    this.state.socket.on('downloadStart', function() {
      this.requestChannels();
    }.bind(this));
  },

  render: function() {
    return (
      <div className="channelBox">
        {this.state.channels.map(function(item, i) {
          return (
            <ChannelTile
              authorClick={this.authorClick.bind(this, i)}
              key={i}
              thumb={item.thumbnail}
              channelName={item.channelName}
            />
          );
        }, this)}
      </div>
    )
  }
});

module.exports = ChannelBox;
