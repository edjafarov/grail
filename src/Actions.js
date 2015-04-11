var ActionsRouter = require("./ActionsRouter");
var Emitter = require('events').EventEmitter;


var ActionsEmitter = new Emitter();



module.exports = function(){

	var doSpecificAction = ActionsRouter();
	var ActionPipe = doSpecificAction.PromisePipe();

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
					