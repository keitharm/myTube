var VideoTile = React.createClass({
  getInitialState: function() {
    return {
      style: {
        display: 'none'
      }
    }
  },
  reveal: function(e) {
    this.setState({style: {display: ''}});
  },
  hide: function() {
    this.setState({style: {display: 'none'}});
  },
  deleteVideo: function(e) {
    this.props.deleteVideo(e);
  },
  render: function() {
    //onClick={this.props.deleteVideo.bind(this, this.props.id)} - put this on delete button that appears on hover
    return (
      <div className="tile" onMouseOver={this.reveal.bind(this, this.props.id)} onMouseLeave={this.hide}>
        <div className="picture" onClick={this.props.vidClick}><img src={this.props.thumb}  /></div>
        <div className="times" style={this.state.style} onClick={this.props.vidClick}>{this.props.currentTime} / {this.props.time}</div>
        <button type="button" className="deleteButton btn btn-danger" style={this.state.style} onClick={this.deleteVideo.bind(this, this.props.id)}>Delete Video</button>
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
