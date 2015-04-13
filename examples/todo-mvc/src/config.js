
module.exports = function(app){
	var Resource = require('../Resource')();
	var PromisePipe = app.actions.PromisePipe;

	PromisePipe.use('get', Resource.get);
	PromisePipe.use('del', Resource.del);
	PromisePipe.use('post', Resource.post);
	PromisePipe.use('put', Resource.put)

	PromisePipe.use('emit', function emit(data, context, eventName, emitData){
		context.emit(eventName, emitData || data);	
		return data;
	});
	PromisePipe.use('catchEmit', function emit(data, context, eventName){
	  context.emit(eventName, data);
	  return data;
	}, {isCatch:true});
}