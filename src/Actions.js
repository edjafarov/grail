var PromisePiper = require("promise-pipe");
var ActionsRouter = require("./ActionsRouter");
var Emitter = require('events').EventEmitter;


var ActionsEmitter = new Emitter();



module.exports = function(){

	var doSpecificAction = ActionsRouter();
	var ActionPipe = PromisePiper();

	var actionObject = Object.create(new Emitter(), {
		doAction: {
			value: function(name, data, context){
				if(!context) throw new Error("Context required for action");
				context.emit = context.actions.emit.bind(context.actions);
				context.actionName = name;
				return ActionPipe.call(context, data, context);
			}
		},
		withContext: {
			value: function(context){
				var that = this;
				return {
					doAction: function(){
						var arg = [].slice.call(arguments);
						arg[2] = context;
						return that.doAction.apply(that, arg);
					}
				}
			}
		},
		actionsPipe: {
			value: ActionPipe
		},
		actionsRouter: {
			value: doSpecificAction
		}
	});
	return actionObject;
}

/*				var newContext = Object.keys(context).reduce(function(newContext, key){
					newContext[key].value = context[key];
					return newContext;
				}, {})
				var emitter = new Emitter();
				context.emit = emitter.emit.bind(emitter);
				context.on = emitter.on.bind(emitter);
				///context = Object.create(new Emitter(), newContext);
		
				if(this.context){
					context = Object.keys(this.context).reduce(function(ctx, name){
						ctx[name] = this.context[name];
						return ctx;
					}.bind(this), context)
				}
*/						