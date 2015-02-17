var PromisePipe = require('promise-pipe');

module.exports = function(appActions){
	appActions.create('items:add')
	.then(function prepare(title){
	  return {
	    title: title,
	    completed: false
	  }
	})
	.post('/api/items')
	.emit('items:item:added');

	appActions.create('items:toggleAll')
	.put('/api/items/toggle')
	.emit('items:got');

	appActions.create('items:clean')
	.del('/api/items/clean')
	.emit('items:got');


	appActions.create('items:item:toggle')
	.put('/api/items/:id/toggle')
	.emit('items:item:toggle');

	appActions.create('items:item:delete')
	.del('/api/items/:id')
	.emit('items:item:remove');

	appActions.create('items:item:change')
	.put('/api/items/:id')
	.emit('items:item:changed');
}

//The Action for /items path. Is taking data from async source data
module.exports.getItems = PromisePipe()
.emit('items:filter', {})
.get('/api/items')
.emit('items:got');

module.exports.getActive = PromisePipe()
.emit('items:filter', {completed: false})
.get('/api/items')
.emit('items:got');

module.exports.getCompleted = PromisePipe()
.emit('items:filter', {completed: true})
.get('/api/items')
.emit('items:got');