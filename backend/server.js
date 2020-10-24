//Constants
const PORT = 8081;
const DB = "db"
const LISTS_COLLECTION = "lists"
const SESSION_COLLECTION = "sessions"
const USER_COLLECTION = "users"
const mongourl = "mongodb://localhost:27017/";
const dbname = "quickpick";

//Initialize Firebase
var admin = require("firebase-admin");
// Path to secret
var serviceAccount = require("./quickpick-7f20f-firebase-adminsdk-hvb4p-96107c2f64.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://quickpick-7f20f.firebaseio.com"
  });

//Initialize express
const { json } = require('express');
const express = require('express');
const app = express();
app.use(express.json()) // for parsing application/json

//Random string helper
function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}


//Initialize mongodb and mongoose
var MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(mongourl);

client.connect(function(err){
    if(err) throw err;
    const db = client.db(dbname)

    //--------User requests
    //TODO: Check if user exists, if he does then update firebase token and if it doesnt then create the user
    app.post('/login', function(req, res){

    });

    //--------List requests
    //Get the lists a user has access to
    //TODO: FB authentication
    app.get('/lists', function (req, res) {
        db.collection(LISTS_COLLECTION).find({}).toArray(function(err, result){
            if(err) res.status(400).send({"ok": false});
            else res.status(200).send(result);
        })
    });

    //--------Session requests
    //Get session
    //TODO: FB Authentication
    app.get('/session:id', function (req, res) {
        db.collection(SESSION_COLLECTION).find({"id": req.params.id}).toArray(function(err, result){
            if (err) res.status(400).send({"ok": false});
            else res.status(200).send({"session": result.ops, "ok": true});
        })
    });

    //Create new session
    //TODO: FB Authentication, add creator to participants
    app.post('/session', function (req, res) {
        var rString = randomString(5, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        var count;
        //Iterate through sessions until we have a unique pin
        do{db.collection(SESSION_COLLECTION).find({"pin": rString}).toArray(function(err, result){
                if(err) res.status(400).send({"ok": false});
                count = result.length;
            })
        }while(count != 0)

        //Create session object
        var session= {
            "pin": rString,
            "list": json(req.body).list,
            "status": "lobby",
            "creator":   json(req.body).facebookToken, //TODO
            "complete": 0,
            "size": json(req.body).size,
            "results": [],
            "participants": [],   
        }
        for(i = 0; i < json(req.body).list.ideas.length; i++){
        }

        res.status(201).send({"ok":true, "session": session});
    });

    //Endpoint to receive user choices for a session
    //TODO: FB Authentication, receive choices, check if done if it is then push firebase notification
    app.post('/session/:id/choices', function (req, res) {
        db.collection(SESSION_COLLECTION).find({"pin": req.params.id}).toArray(function(err, result){
            if(err) res.status(400).send({"ok": false});

            for(i = 0; i < result.ops.choices.length; i++){
                result.ops.choices[i]
            }
        })
    });

    //Adds a user to a session
    //TODO: FB authentication to find user??, Firebase notification to notify people
    app.post('/session/:id', function (req, res) {
        db.collection(SESSION_COLLECTION).find({"pin": req.params.id}).toArray(function(err, result){
            if(err) res.status(400).send({"ok": false});
            else{
                //result.participants.push(json(req.body).) 
            }
        })
    });

    //Starts and runs a session
    //TODO: FB authentication, check if user is creator of session, push firebase notification to all devices that it started
    app.put('session/:id', function(req, res){
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

