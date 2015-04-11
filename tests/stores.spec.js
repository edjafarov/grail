var grail = require('../src');
var Router = require('react-router');
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var React = require('react');
var PromisePipe = require('promise-pipe');
var sinon = require('sinon');
var expect = require('chai').expect;


describe('Bootstrap Grail app with stores', function(){
  var app = grail.createApp();

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
  
  var AppComp = React.createClass({
    render: function () {
      return (
            React.createElement("div", {className: "container"}, 
                    React.createElement(RouteHandler, null)
            )
        );
    }
  });

  var ItemsComp = React.createClass({
    mixins: [grail.ContextMixin],
    getInitialState: function(){
      return {
        items: this.context.stores.ItemsStore.get()
      }
    },
    componentDidMount: function() {
      this.context.stores.ItemsStore.on('change', this.change);
    },
    change: function(items){
      if(!this.isMounted()) return;
      this.setState({items: items});
    },    
    render: function () {
      return (
          React.createElement("div", {className: "items"}, 
            this.state.items.map(function(item, i){
              return React.createElement("div", null, item)
            })
          )
        );
    }
  });
  var rootAction = app.actions.PromisePipe();
  var nestedAction =  app.actions.PromisePipe().then(function(data, context){
    context.emit('got:items', [1,2,3]);
    return data;
  });


  var routes = React.createElement(Route, {path: "/", handler: AppComp, action: rootAction}, 
      React.createElement(Route, {name: "items", path: "items", handler: ItemsComp, action: nestedAction, stores: ItemsStore})
  )

  app.useRoutes(routes);
 
  var mokedApp = app.init()

  describe('the /items path should be rendered',function(){
    var htmlResult;
    before(function(done){
      mokedApp.middleware({originalUrl: "/items"},{end:function(result){
        htmlResult = result;
        done();
      }});
    })
    it('with data from store', function(){
      expect(htmlResult).to.have.string('<div class="container"');
      expect(htmlResult).to.have.string('<!DOCTYPE html><html><head>');
      expect(htmlResult).to.have.string('<div class="items"');
      expect(htmlResult).to.have.string('>1</div><div');
      expect(htmlResult).to.have.string('>2</div><div');
      expect(htmlResult).to.have.string('>3</div></div>');
    });
    it('app.flush will return a snapshot of app"s data', function(){
      var snapshot = app.flush();
      expect(snapshot).to.eql({ItemsStore: [1,2,3]});
    })
  });
 

  
});
