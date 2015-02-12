# grail - simple React based isomorphic apps framework

##install

##getting started

Grail architecture is really simple. We use react router to handle isomorphic routing and rendering components. Additionally router triggers actions [PromisePipe](https://github.com/edjafarov/PromisePipe) that fill stores for rendered components. 

The very basic example is [here](https://github.com/edjafarov/grailjs/tree/master/examples/basic)

Lets start with general app. The app will consist of two routes Home (/) and Items (/items)

We will use react router thus we have 

```javascript
var Router = require('react-router');
var Route = Router.Route;

var routes = <Route path="/" name="home" handler={AppComp} >
    <Route name="items" path="items" handler = {ItemsComp} action={getItems} stores={ItemsStore}/>
  </Route>
```

We need to build up AppComp and ItemsComp.

```javascript
var React = require('react');
var grail = require('grail');
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;

var AppComp = React.createClass({
  render: function () {
    return (
      <div className="container">
      	<Link to="home" >Home</Link> - <Link to="items">Show Items</Link>
        <RouteHandler/>
      </div>
    );
  }
});

//render Items component
var ItemsComp = React.createClass({
    mixins: [grail.ContextMixin],
    getInitialState: function(){
    	//get initial data from ItemsStore
      return {
        items: this.context.stores.ItemsStore.get()
      }
    },
    componentDidMount: function() {
    	//listen to ItemsStore changes
      this.context.stores.ItemsStore.on('change', this.change);
    },
    change: function(items){
    	//set state only if mounted
      if(!this.isMounted()) return;
      this.setState({items: items});
    },
  	render: function () {
	    return (
      <ul className="items">
        {this.state.items && this.state.items.map(function(item){
          return <div>{item}</div>
        })}
      </ul>
    );
  }
});
```

To render Components though we need a ItemsStore to contain Items.

```javascript
var ItemsStore = grail.BasicStoreFactory('ItemsStore', {
  items: null,
  init: function(context){
    context.actions.on('got:items', this.gotItems.bind(this));
  },
  gotItems: function(items){
    this.items = items;
    this.emit('change', this.items);
  },
  get: function(){
    return this.items;
  }
});

```
And an action to fill the Store. As Actions we are using [PromisePipe](https://github.com/edjafarov/PromisePipe)

```javascript
var PromisePipe = require('promise-pipe');

PromisePipe.use('emit', function emit(data, context, eventName){
	context.emit(eventName, data);
	return data;
});


//The Action for /items path. Is taking data from async source data
var getItems = PromisePipe().then(function(data){
	return new Promise(function(resolve, reject){
		setTimeout(function(){
			resolve([1,2,3,4,5,6,7,8,9,10])
		}, 100);
	})
	
}).then(function emit(data, context){
	context.emit('got:items', data);
	return data;
});
```

And now we need to create and init app with routes:

```javascript
var app = grail.createApp();
app.useRoutes(routes);

module.exports = app.init();
```

This will be a `client.js` and we are exporting an object with middleware property that we can use in our server.


The server will look like:

```javascript
var express = require('express');
var app = express();

require('node-jsx').install({harmony: true, extension: '.js'})

app.use(express.static(__dirname + '/dist'));
var clientAppMiddleware = require("./client").middleware;
app.use(clientAppMiddleware);

app.listen(3000);
console.log("Server is on 3000 port");
 ```
