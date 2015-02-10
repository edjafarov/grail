module.exports = { 
  linkDataState: function(key){
      return {
        value: this.state.data[key],
        requestChange: function(value){
            var data = this.state.data;
            data[key] = value;
            this.setState({data:data});
        }.bind(this)
      }
   }  
}