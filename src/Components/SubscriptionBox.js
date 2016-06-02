//var DropDownMenu = require('./DropDownMenu');
var VideoTile = require('./VideoTile')
var SubscriptionBox = React.createClass({
  getInitialState: function() {
    return {
      videos: []
    };
  },

  componentDidMount: function() {
    this.serverRequest = $.get('/api/videos', function (vids) {
      var videos = [];

      vids.forEach(vid => {
        videos.push(<VideoTile
          name={vid.name}
          thumb={vid.thumbnail}
          id={vid.youtubeID}
        />);
      });
      this.setState({
        videos
      });
    }.bind(this));
  },

  render: function() {

    return (
      <div className="subscriptionBox">
        {this.state.videos}
      </div>
    )
  }
});

module.exports = SubscriptionBox;
