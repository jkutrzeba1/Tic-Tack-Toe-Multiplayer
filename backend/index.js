const express = require("express");
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var lobby = require("./lobby.js");

lobby(io);

const port = 8080;

app.get("/dupa", function(req, res){
  res.send("HW");
})

http.listen(port, ()=>{
  console.log("Express server listen on " + port);
})
