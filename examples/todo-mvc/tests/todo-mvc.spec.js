require('node-jsx').install({harmony: true, extension: '.js'})
var grail = require('grail');
var PromisePipe = require('promise-pipe');
var expect = require('chai').expect;
require('../src/config');

var app = grail.createApp();
var actions = require('../src/actions')(app.appActions);
var ItemsStore = require('../src/ItemsStore');
app.use(ItemsStore);
require('../server')
//TODO: expose real appActions
//var doAction = app.appActions.withContext(app.context).doAction;

describe('Todo-mvc actions', function(){
	console.log(doAction);
});