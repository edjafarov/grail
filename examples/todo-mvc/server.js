var express = require('express');
var app = express();
var compression = require('compression');
var bodyParser = require('body-parser')
var session = require('cookie-session');
require.extensions['.css'] = function(){
	return null;
} 
require('node-jsx').install({harmony: true, extension: '.js'})

process.env.HOSTNAME = "http://localhost:3000"
app.use(compression({level:9}));
app.use(express.static(__dirname + '/dist'));
app.use(session({
  keys: ['key1', 'key2']
}))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var clientAppMiddleware = require("./src/client").middleware;



app.get("/api/items", function(req, res){
	if(!req.session.items) req.session.items = [];
	res.json(req.session.items);
});

app.post("/api/items", function(req, res){

	if(!req.session.items) req.session.items = [];
	var item = req.body;
	item.id = req.session.items.length;
	req.session.items.push(req.body);

	res.json(item);
});

app.put("/api/items", function(req, res){
	if(!req.session.items) req.session.items = [];
	var items = req.body;
	req.session.items = items.map(function(item, i){
		return item.id = i;
	});
	res.json(req.session.items);
});
app.put("/api/items/toggle", function(req, res){
	if(!req.session.items) req.session.items = [];
	req.session.items = req.session.items.map(function(item, i){
		item.completed = req.body.completed;
		return item;
	});
	res.json(req.session.items);
})

app.delete("/api/items/clean", function(req, res){
	if(!req.session.items) req.session.items = [];
	req.session.items = req.session.items.reduce(function(items, item){
		if(!item.completed) items.push(item);
		return items;
	},[]);
	res.json(req.session.items);
})


app.put("/api/items/:id/toggle", function(req, res){
	var newItem = req.session.items[req.params.id];
	newItem.completed = !newItem.completed;
	res.json(newItem);
})

app.put("/api/items/:id", function(req, res){
	var newItem = req.body;
	newItem.id = req.params.id;
	req.session.items[newItem.id] = newItem;
	res.json(newItem);
});

app.get("/api/items/:id", function(req, res){
	res.json(req.session.items[req.params.id]);
});

app.delete("/api/items/:id", function(req, res){
  var removedItem = {};
  req.session.items = req.session.items.reduce(function(items, item){
    if(item.id != +req.params.id) {
    	items.push(item);
    } else{
    	removedItem = item;
    }
    return items;
  },[]);
  res.json(removedItem)
  
});

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

app.use(clientAppMiddleware);

app.listen(3000);
console.log("Server is on 3000 port");
