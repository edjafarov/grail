var request = require('superagent');
var hostname = process.env.HOSTNAME || "";
var path = require("path");
var Promise = require('es6-promise').Promise;
var url = require('url');

function prepreUrl(url){
  return Object.keys(this.params).reduce(function(urlString, name){
    urlString = urlString.replace(new RegExp("\\/(:" + name + ")(\\/|$)","g"), ["/", this.params[name], "/"].join(""));
    urlString = urlString.replace(/\/$/, "");
    return urlString;
  }.bind(this), url);
}

function Resource(agent){
  request = agent || request;
  return ['get','head','del','patch','post','put'].reduce(function(req, name){
    var old = req[name];
    req[name] = function(){
      var args = arguments;// todo hostname join path
      args[0] = url.resolve(hostname, args[0]);
      return old.apply(this, args);
    }
    return req;
  }, request);
}

function makeUrl(url, params){
  return Object.keys(params).reduce(function(urlString, name){
    urlString = urlString.replace(new RegExp("\\/(:" + name + ")(\\/|$)","g"), ["/", params[name], "/"].join(""));
    urlString = urlString.replace(/\/$/, "");
    return urlString;
  }, url);
}


module.exports = function(agent){
  var resource = Resource(agent);
  return {
    get:function get(data, context, url, options){
      return new Promise(function(resolve, reject){
        var req = resource.get(makeUrl(url, context));

        req.on('error', function(err){
          reject(err);
        })
        req.end(function(res){
          if(res.error) return reject(res.error);
          resolve(res.body);
        });

        if(context.request && context.request.headers){
          req.set(context.request.headers);
        }

        if(options && options.query){
          var query = options.query;
          if(typeof(options.query) == 'function'){
            query = options.query.call(context, data, context);
          }
          req.query(query);
        }
      });
    },
    post: function post(data, context, url, body, query){
      return new Promise(function(resolve, reject){
        var req = resource.post(prepreUrl.call(context, url));
        if(context.request && context.request.headers){
          req.set(context.request.headers);
        }     
        if(query && typeof(query) == 'function') {
          req.query(query.call(context, data));
        } else if(query && typeof(query) == 'object'){
          req.query(query);
        }

        if(body && typeof(body) == 'function'){
          req.send(body.call(context, data));
        } else if(body && typeof(body) == 'object'){
          req.send(body);
        } else if(body && typeof(body) == 'string') {
          req.send(data[body]);
        } else if(!body && data){
          req.send(data);
        }

        req.on('error', function(err){
          reject(err);
        })
        req.end(function(res){
          if(res.error) return reject(res.error);
          resolve(res.body);
        })
      })
    },
    put: function put(data, context, url, body, query){
      return new Promise(function(resolve, reject){
        var req = resource.put(prepreUrl.call({params: data}, url));
        if(context.request && context.request.headers){
          req.set(context.request.headers);
        }     
        if(query && typeof(query) == 'function') {
          req.query(query.call(context, data));
        } else if(query && typeof(query) == 'object'){
          req.query(query);
        }

        if(body && typeof(body) == 'function'){
          req.send(body.call(context, data));
        } else if(body && typeof(body) == 'object'){
          req.send(body);
        } else if(body && typeof(body) == 'string') {
          req.send(data[body]);
        } else if(!body && data){
          req.send(data);
        }

        req.on('error', function(err){
          reject(err);
        })
        req.end(function(res){
          if(res.error) return reject(res.error);
          resolve(res.body);
        })
      })
    },
    del:function del(data, context, url, query){
      return new Promise(function(resolve, reject){
        var req = resource.del(data?prepreUrl.call({params: data}, url):url);
        if(context.request && context.request.headers){
          req.set(context.request.headers);
        }
        
        if(typeof(query) == 'function') {
          req.query(query.call(context, data));
        } else if(typeof(query) == 'object'){
          req.query(query);
        }
        req.on('error', function(err){
          reject(err);
        })
        req.end(function(res){
        if(res.error) return reject(res.error);
          resolve(res.body);
        });
      });
    }
  };
}

//Resource.post(url, {query:[function/string/hash/array]})
//Resource.post(url, {query:[function/string/hash/array]})



