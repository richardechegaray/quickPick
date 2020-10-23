//Constants
const PORT = 8081;
const DB = "db"
const LISTS_COLLECTION = "lists"
const mongourl = "mongodb://localhost:27017/";
const SESSION_COLLECTION = "sessions"

const { json } = require('express');
//Initialize express
const express = require('express');
const app = express();
app.use(express.json()) // for parsing application/json


function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

//Initialize mongodb and mongoose
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(mongourl, function(err, db){
    if(err) throw err;


    //--------List requests
    //Get a specific list with ID
    /*app.get('/list/:id', function (req, res) {
        var query = {"id_": req.params.id_}
    });

    //Create a new list
    app.post('/list', function (req, res) {
        //Check if list exists with the same name and user
        if(db.getCollectionNames().indexOf(json(req.body).userName + '-' + json(req.body).listName) == -1){
            res.status(403).send({'message': 'List already exists', 'status': 'Failed'});
        }
        else{
            db.createCollection(json(req.body).user + '-' + json(req.body).listName, function(err, res){
                if (err) throw err;
                res.status(201).send({'message': 'Collection successfully made', 'status': 'Success');
            })
        }

        }
    });*/
    
    //Delete an existing list
    /*app.delete('/list/:id', function (req, res) {
        res.send('hello world');
    });*/

    //Get the lists a user has access to
    //TODO: FB authentication
    app.get('/lists', function (req, res) {
        db.collection(LISTS_COLLECTION).find({}).toArray(function(err, result){
            if(err) res.status(400).send({"ok": false});
            else{
                res.status(200).send(result);
            }
        })
    });


    //--------Session requests
    //Get session
    //TODO: FB Authentication
    app.get('/session:id', function (req, res) {
        db.collection(SESSION_COLLECTION).find({"id": req.params.id}).toArray(function(err, result){
            if (err) res.status(400).send({"ok": false});
            else res.status(200).send({"session": result, "ok": true});
        })
    });

    //Create new session
    //TODO: FB Authentication, add creator to participants
    app.post('/session', function (req, res) {
        var rString = randomString(5, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        var count;
        do{
            db.collection(SESSION_COLLECTION).find({"pin": rString}).toArray(function(err, result){
                if(err) res.status(400).send({"ok": false});
                count = result.length;
            })
        }while(count != 0)

        var session= {
            "pin": rString,
            "status": "lobby",
            "participants": [],
            "list": json(req.body).list
        }

        res.send('hello world');
    });

    //Endpoint to send user choices for a session
    //TODO: FB Authentication, receive choices, check if done if it is then push firebase notification
    app.post('/session/:id/choices', function (req, res) {
        
    });

    //Adds a user to a session
    //TODO: FB authentication to find user??, Firebase notification to notify people
    app.post('/session/:id', function (req, res) {
        db.collection(SESSION_COLLECTION).find({"id": req.params.id, "pin": json(req.body).pin}).toArray(function(err, result){
            if(err) res.status(400).send({"ok": false});
            else{
                //result.participants.push(json(req.body).) 
            }
        })
    });

    //Update the list for a session
    /*app.put('/session/:id', function(req, res) {
        res.send('herllo world');
    });*/

    //Starts and runs a session
    //TODO: FB authentication, check if user is creator of session, push firebase notification to all devices that it started
    app.put('session/:id/start', function(req, res){
        db.collection(SESSION_COLLECTION).find({"id": req.params.id}).toArray(function(err, result){
            if(err) res.status(400).send({"ok": false});
            else{ 
                result.status = "running";
            }
        })
    });

    //-------Listen on port
    var server = app.listen(PORT, function() {
        var host = server.address().address;
        var port = server.address().port;
        console.log("Listening at http://%s:%s", host, port);
    });
});

