var express = require('express');
var app = express();

require('node-jsx').install({harmony: true, extension: '.js'})

app.use(express.static(__dirname + '/dist'));
var clientAppMiddleware = require("./client").middleware;
app.use(clientAppMiddleware);

app.listen(3000);
console.log("Server is on 3000 port");
