var Promise = require('es6-promise').Promise;
var PromisePipe = require('promise-pipe')();


function getRouter(){
  var routes = {};
  var actionsRouter = function(data, context){
    var actionNames = context.actionName instanceof Array?context.actionName:[context.actionName];
    var promises = actionNames.reduce(function(promises, actionName){
      if(routes[actionName]) promises.push(routes[actionName].call(context, data, context));
      return promises; 
    }, []);

    var result = promises.length>0?Promise.all(promises):Promise.resolve(data);
    return result;
  }
  actionsRouter.PromisePipe = PromisePipe;
  actionsRouter.create = function(name, pipe){
    if(!name) return PromisePipe();
    routes[name] = pipe || PromisePipe();
    return routes[name];
  }

  return actionsRouter;
}

module.exports = getRouter;










