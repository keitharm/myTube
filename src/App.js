var SubscriptionBox = require('./Components/SubscriptionBox');

var App = React.createClass({
  render: function() {
    return (
      <div className="container-fluid">
        <div className="row header">
          <div className="col-xs-6 col-md-4"><a href="/">myTube</a></div>
        </div>
        <div className="row myTube">
          <span className="title">Subscriptions</span>
          <div className="container-fluid">
            <SubscriptionBox />
          </div>
        </div>
      </div>
    )
  }
});

ReactDOM.render(<App />, document.getElementById('app'));
