# grail - simple React based isomorphic apps framework

##install

##getting started

Lets start with general app

```javascript
var grail = require('grail');
var Router = require('react-router');
var Route = Router.Route;
var PromisePipe = require('promise-pipe');

var RouteHandler = Router.RouteHandler;
var React = require('react');


var AppComp = React.createClass({
  render: function () {
    return (
      <div className="container">
        <Link to="/items" >Show Items</Link>
        <RouteHandler/>
      </div>
    );
  }
});
```