var React = require('react');

var ContextMixin = {
	contextTypes: {
    doAction: React.PropTypes.func.isRequired,
    stores: React.PropTypes.object.isRequired
  },
  bindContext: bindContext
}

function bindContext(){
	if(this.context && this.context.app) {
		Object.keys(this.context.app).forEach(function(name){
			this[name] = this.context.app[name];
		}.bind(this))
	}
}

module.exports = ContextMixin;