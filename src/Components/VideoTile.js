var VideoTile = React.createClass({
  render: function() {
    return (
      <div className="videoTile">
        <div className="picture" onClick={this.props.vidClick}><img src={this.props.thumb} /></div>
        <div className="name" onClick={this.props.vidClick}>{this.props.title}</div>
        <div className="author" onClick={this.props.authorClick}>{this.props.channelName}</div>
        <div className="info">{this.props.info}</div>
      </div>
    )
  }
});

/*
<div className="picture" onClick={this.props.vidClick}><img src='http://localhost:3000/img/a.jpg' /></div>
<div className="name" onClick={this.props.vidClick}>MAKE THEM ALL FLOOFY</div>
<div className="author" onClick={this.props.authorClick}>Snow Dogs Vlogs</div>
<div className="info">3,720 views • 5 hours ago</div>
*/

module.exports = VideoTile;