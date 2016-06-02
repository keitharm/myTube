var VideoTile = React.createClass({
  render: function() {
    return (
      <div className="videoTile">
        <div className="picture"><a href=""><img src='http://localhost:3000/img/a.jpg' /></a></div>
        <div className="name"><a href="">MAKE THEM ALL FLOOFY</a></div>
        <div className="author"><a href="">Snow Dogs Vlogs</a></div>
        <div className="info">3,720 views • 5 hours ago</div>
      </div>
    )
  }
});

module.exports = VideoTile;