var Chains = require('./Chains');
var appActions = require("./Actions")();

//add common actions behavior
appActions.actionsPipe
// render if is rendering on client
.then(Chains.renderIfClient)
//do real specific actions
.then(appActions.actionsRouter)

// render if rendering on server
.then(Chains.renderIfServer)	
//catch errors after
.catch(logErrorAction) 


function logErrorAction(data, context){
  console.log("ERROR:", context.actionName, data);
  return data;
}

module.exports = appActions;