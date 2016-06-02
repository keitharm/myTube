//var DropDownMenu = require('./DropDownMenu');
var VideoTile = require('./VideoTile')
var SubscriptionBox = React.createClass({
  render: function() {

    return (
      <div className="subscriptionBox">
        <VideoTile />
        <VideoTile />
        <VideoTile />
        <VideoTile />
        <VideoTile />
        <VideoTile />
        <VideoTile />
      </div>
    )
  }
});

module.exports = SubscriptionBox;
