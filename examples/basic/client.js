var grail = require('grail');
var PromisePipe = require('promise-pipe');
var React = require('react');
var Promise = require('es6-promise').Promise;
var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;

var app = grail.createApp();


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


var routes = <Route path="/" name="home" handler={AppComp} >
    <Route name="items" path="items" handler = {ItemsComp} action={getItems} stores={ItemsStore}/>
  </Route>


app.useRoutes(routes);


module.exports = app.init();

