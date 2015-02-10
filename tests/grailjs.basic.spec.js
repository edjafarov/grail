var grail = require('../src');
require('node-jsx').install({harmony: true, extension: '.js'})
var Router = require('react-router');
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var React = require('react');
var PromisePipe = require('promise-pipe');
var sinon = require('sinon');
var expect = require('chai').expect;


describe('Bootstrap Grail app', function(){
  var app = grail.createApp();
  
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
    render: function () {
      return (
          React.createElement("div", null, "Items")
        );
    }
  });
  var rootSpy = sinon.spy();
  var nestedSpy = sinon.spy();
  var rootAction = PromisePipe().then(function(){
    rootSpy.apply(this, arguments)
  })
  var nestedAction = PromisePipe().then(function(){
    nestedSpy.apply(this, arguments)
  })


  var routes = React.createElement(Route, {path: "/", handler: AppComp, action: rootAction}, 
      React.createElement(Route, {name: "items", path: "items", handler: ItemsComp, action: nestedAction})
  )

  app.useRoutes(routes);
  var mokedApp = app.init()

   
  it('the root should be rendered', function(done){
    var htmlSpy = sinon.spy();
    mokedApp.middleware({originalUrl: "/"},{end:function(htmlResult){
      expect(rootSpy.getCall(0).args[1].path).to.be.equal('/');
      expect(nestedSpy.called).to.not.be.ok;
      expect(htmlResult).to.have.string('<div class="container"');
      expect(htmlResult).to.have.string('<!DOCTYPE html><html><head>');
      expect(htmlResult).to.not.have.string('Items</div></div>');
      done();
    }});
  })

  it('the /items path should be rendered', function(done){
    rootSpy.reset();
    mokedApp.middleware({originalUrl: "/items"},{end:function(htmlResult){
      expect(rootSpy.getCall(0).args[1].path).to.be.equal('/items');
      expect(htmlResult).to.have.string('<div class="container"');
      expect(htmlResult).to.have.string('<!DOCTYPE html><html><head>');
      expect(htmlResult).to.have.string('Items</div></div>');
      done();
    }});
  })
});