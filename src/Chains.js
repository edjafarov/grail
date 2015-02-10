var clientRederedOnce = false;
var RouteHandler = require('./RouteHandler');

module.exports = {
	renderIfClient: function renderIfClient(data, context){
    if(RouteHandler.isClient && clientRederedOnce && context.path && context.routeAction) {
      context.$render();
      clientRederedOnce = true;
    }
    return data;
  },
	renderIfServer: function renderIfServer(data, context){
    if(context.path && context.routeAction &&  (!RouteHandler.isClient || !clientRederedOnce)) {
      if(context._emitted) throw new Error("Action could not be finalized twice: " + actionName);
      context._emitted = true;
      try{
        context.$render();
      } catch (e){
        console.log(e)
      }
      
    }
    return data;
  }
}



  

  
