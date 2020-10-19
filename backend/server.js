const express = require('express');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const app = express();
const PORT = 8081;

//--------List requests
//Get a specific list with ID
app.get('/list/:id', function (req, res) {
    res.send('hello world');
  });

//Create a new list
app.post('/list', function (req, res) {
    res.send('hello world');
  });

//Update an existing list
app.put('/list/:id', function (req, res) {
    res.send('hello world');
  });
  
//Delete an existing list
app.delete('/list/:id', function (req, res) {
    res.send('hello world');
  });

//Get the ID's of lists a user has access to
app.get('/lists', function (req, res) {
    res.send('hello world');
  });


//--------Session requests
//Get session state
app.get('/session', function (req, res) {
    res.send('hello world');
  });

//Create new session
app.post('/session/:id', function (req, res) {
    res.send('hello world');
  });

//Endpoint to send user choices for a session
app.post('/session/:id/choices', function (req, res) {
    res.send('hello world');
  });

//Adds a user to a session
app.post('/session', function (req, res) {
    res.send('hello world');
  });

//Update the list for a session
app.put('/session/:id', function(req, res) {
    res.send('herllo world');
});

//-------Listen on port
var server = app.listen(PORT, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Listening at http://%s:%s", host, port);
});