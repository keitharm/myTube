var ChannelTile = React.createClass({
  render: function() {
    return (
      <div className="tile">
        <div className="picture" onClick={this.props.authorClick}><img src={this.props.thumb} /></div>
        <div className="name" onClick={this.props.authorClick}>{this.props.channelName}</div>
        <div className="info"></div>
      </div>
    )
  }
});

module.exports = ChannelTile;