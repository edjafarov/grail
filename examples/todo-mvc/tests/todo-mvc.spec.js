require('node-jsx').install({harmony: true, extension: '.js'})
process.env.HOSTNAME = "http://localhost:3000";
require.extensions['.css'] = function(){
	return null;
} 

//var grail = require('grail');
//var PromisePipe = require('promise-pipe');
var expect = require('chai').expect;
var clientApp = require('../src/client');
var app = clientApp.app;

// inject agent to mimic browser session
var request = require('superagent');
var PromisePipe = require('promise-pipe');
var Resource = require('../Resource')(request.agent());
PromisePipe.use('get', Resource.get);
PromisePipe.use('del', Resource.del);
PromisePipe.use('post', Resource.post);
PromisePipe.use('put', Resource.put)
//

require('../server')

app.context.params ={};
var doAction = app.appActions.withContext(app.context).doAction;

describe('Todo-mvc actions', function(){
	describe('add item (items:add)', function(){
		var ItemsStore = app.context.stores.ItemsStore;
		var items;
		before(function(done){
			doAction('items:add', "Mock Item").then(function(){
				items = ItemsStore.get();
				done()
			});
		});
		it('adds mock one item to ItemsStore', function(){
			expect(items).to.have.length(1);
		})
		it('item have title Mock Item', function(){
			expect(items[0]).to.have.property('title', 'Mock Item');
		})
		it('item have id', function(){
			expect(items[0]).to.have.property('id');
		})		
		it('item is not completed', function(){
			expect(items[0]).to.have.property('completed', false);
		})				
		//WTF			
		describe('add second item, / the root url (/$default)', function(){
			before(function(done){
				doAction('items:add', "Mock Item1").then(function(){
					//clean items
					ItemsStore.items = [];
					doAction('/$default').then(function(){
						items = ItemsStore.get();
						done()
					});
				})
			});
			it('will get 2 items',function(){
				expect(items).to.have.length(2);
			});
			it('items have proper titles', function(){
				expect(items[0]).to.have.property('title', 'Mock Item');
				expect(items[1]).to.have.property('title', 'Mock Item1');
			})			
		})
		describe('change first item title (items:item:change)', function(){
			before(function(done){
				ItemsStore.items = [];
				doAction('/$default').then(function(){
					items = ItemsStore.get();
					items[0].title = "Changed Item";
					doAction('items:item:change', items[0]).then(function(){
						ItemsStore.items = [];
						doAction('/$default').then(function(){
							items = ItemsStore.get();
							done()
						});
					});
				});
			});
			it('item was changed',function(){
				expect(items[0]).to.have.property('title', 'Changed Item');
			})
		})

		describe('toggle items (items:toggleAll)', function(){
			before(function(done){
				ItemsStore.items = [];
				doAction('/$default').then(function(){
					items = ItemsStore.get();
					doAction('items:toggleAll', {completed: true}).then(function(){
					items = ItemsStore.get();
						done();
					});
				});				
			})
			it('all items should be checked',function(){
				items.forEach(function(item){
					expect(item).to.have.property('completed', true);
				})
			})	
			describe('toggle items back', function(){
				before(function(done){
					ItemsStore.items = [];
					doAction('/$default').then(function(){
						items = ItemsStore.get();
						doAction('items:toggleAll', {completed: false}).then(function(){
						items = ItemsStore.get();
							done();
						});
					});				
				})
				it('all items should be unchecked',function(){
					items.forEach(function(item){
						expect(item).to.have.property('completed', false);
					})
				})									
			})		
		})

		describe('toggle single item (items:item:toggle)', function(){
			var previous;
			before(function(done){
				ItemsStore.items = [];
				doAction('/$default').then(function(){
					items = ItemsStore.get();
					previous = items[0]
					doAction('items:item:toggle', {id: previous.id}).then(function(){
					items = ItemsStore.get();
						done();
					});
				});				
			})
			it('item should be toggled', function(){
				expect(items[0]).to.have.property('completed', !previous.completed);
			})
			describe('clean toggled items (items:clean)', function(){
				before(function(done){
					ItemsStore.items = [];
					doAction('/$default').then(function(){
						items = ItemsStore.get();
						previous = items[0]
						doAction('items:clean').then(function(){
						items = ItemsStore.get();
							done();
						});
					});				
				})
				it('completed items should cleaned up', function(){
					expect(items).to.have.length(1);
				})								
			})
			describe('delete toggled item (items:item:delete)', function(){
				before(function(done){
					ItemsStore.items = [];
					doAction('/$default').then(function(){
						items = ItemsStore.get();
						doAction('items:item:delete', {id: items[0].id}).then(function(){
						items = ItemsStore.get();
							done();
						});
					});				
				})
				it('item sholud be removed', function(){
					expect(items).to.have.length(0);
				})								
			})			
		});
	});
});