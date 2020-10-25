//Constants
const PORT = 8081;
const DB = "db"
const LISTS_COLLECTION = "lists"
const SESSION_COLLECTION = "sessions"
const USER_COLLECTION = "users"
const mongourl = "mongodb://localhost:27017/";
const dbname = "quickpick";
/*
---------Initialization
*/
//Initialize Firebase
var admin = require("firebase-admin");
// Path to secret
var serviceAccount = require("./quickpick-7f20f-firebase-adminsdk-hvb4p-96107c2f64.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://quickpick-7f20f.firebaseio.com"
  });

//Initialize express
const app = require('express')()
const bodyParser = require('body-parser')
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

//Initialize mongodb
var MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(mongourl);

//Import Axios and Auth module for Facebook authentication
var axios = require('axios');
var auth = require("./middleware/authentication");
require('dotenv').config();

/*
----------Helper functions
*/
//Random string helper
//Params: length, chars
//Returns: string
function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

//Helper function for sending firebase messages
function sendFirebase(session){
    //Get firebase tokens of everyone in the session
    var registrationTokens = [];
    for(i = 0; i < session.participants.length; i++){
        db.collection(USER_COLLECTION).findOne({"id": session.participants[i].id}, function(err, res){
            registrationTokens.push(res[0].firebaseToken)
            })
        }    
    //Push messsage
    const message = {
        data: {"type":"session", "results": session},
        tokens: registrationTokens
    }
    admin.messaging().sendMulticast(message)
    .then((response) => { 
        console.log(response.successCount + ' session end messages were sent');
    })
}

//Helper function for sorting a sessions results
function sortSession(session){
    var results = session.results;
    results.sort(function(a,b){ return b.score - a.score})
    session.results = results;
    return session;
}


/*
--------Endpoints
*/
client.connect(function(err){
    if(err) throw err;
    const db = client.db(dbname)

    //--------User requests
    //TODO: Check if user exists, if he does then update firebase token and if it doesnt then create the user
    app.post("/login", auth.checkFB, function(req, res, next) {
        let db = client.db("quickpick");
        /* Check users collection for document with matching FB id */ 
        db.collection("users").findOne({id: String(res.locals.id)})
        .then((mydoc) => {
            /* If a user in the DB has a matching id */
            if (mydoc != null) {
            res.json({ "message": "Successfully verified existing user",
                            "ok": true });
            }
            else {
                /* Get user's name */
                let url = `https://graph.facebook.com/v8.0/${res.locals.id}?access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`
                axios.get(url)
                .then(fb_response => {
                    /* Create new user */
                    db.collection('users').insertOne(
                        { 
                            "id": String(res.locals.id), 
                            "name": String(fb_response.data.name),
                            "firebaseToken": String(req.body.firebaseToken)
                        });
                    res.json({ "message": "Successfully created a new user",
                                    "ok": true });
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500);
            res.json({
                "message": "Error during authentication",
                     "ok": false })
        });
    })

    //--------List requests
    //Get the lists a user has access to
    //TODO: FB authentication
    app.get('/lists', auth.checkFB, function (req, res) {
        db.collection(LISTS_COLLECTION).find({}).toArray(function(err, result){
            if(err) res.status(400).send({"ok": false, "message": "Couldn't retrieve lists"});
            else {
                res.status(200).send(result);
            }
        })
    });

    //--------Session requests
    //Get session
    //TODO: FB Authentication
    app.get('/session:id', auth.checkFB, function (req, res) {
        var o_id = new mongo.ObjectID(req.params.id);

        db.collection(SESSION_COLLECTION).find({_id : o_id}).toArray(function(err, result){
            if (err) res.status(400).send({"ok": false, "message": "Session doesn't exist"});
            else res.status(200).send({"session": result.ops, "ok": true});
        })
    });

    //Create new session
    //TODO: FB Authentication, add creator to participants
    app.post('/session', auth.checkFB, function (req, res) {
        var rString = randomString(5, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        var count;
        //TODO: Iterate through sessions until we have a unique pin
       
        //Create session object
        var session= {
            "pin": rString,
            "list": req.body.list, //{"name": "Movie Genres", "ideas": [{"name": "Horror"}, {'name': 'Comedy'}, {'name': 'Action'}]}, //TODO: not hardcoded list
            "status": "lobby",
            "creator": 0, //TODO
            "complete": 0,
            "size": req.body.size,
            "results": [],
            "participants": [],   
        }
        //Create results array with 0 counts
        var resultArray = []
        for(i = 0; i < session.list.ideas.length; i++){
            var ideaname = session.list.ideas[i].name;
            var jsonVar = {}
            jsonVar[ideaname] = 0;
            resultArray.push(jsonVar);
        }
        session.results = resultArray;       
        db.collection(SESSION_COLLECTION).insertOne(session, function(err, result) {
            if (err) res.status(400).send({ok: false, "message": "Session couldn't be inserted into DB"});
            else res.status(201).send({"ok":true, "session": session});
          }); 
        
    });

    //Endpoint to receive user choices for a session
    //TODO: FB Authentication and firebase tokens
    app.post('/session/:id/choices', auth.checkFB, function (req, res) {
        var query = {pin: req.params.id}
        db.collection(SESSION_COLLECTION).find(query).toArray(function(err, foundSessions){
            if(err || foundSessions.length == 0){
                res.status(400).send({"ok": false, "message": "Session doesn't exist"});
            }
            else{
                //Iterate through responses, and also session to find idea names that match
                for(i = 0; i < req.body.choices.length; i++){
                    for(j = 0; j < foundSessions[0].results.length; j++){

                        //If they match and the response is positive, then increment the record
                        if(req.body.choices[i].idea.name == foundSessions[0].results[j].idea.name && req.body.choices[i].choice){
                            var count = foundSessions[0].results[j].score + 1;
                            foundSessions[0].results[j].score = count;
                        }
                    }
                }
                //Push firebase notification if everyone has submitted their results
                var newComplete = foundSessions[0].complete + 1;
                if(newComplete == foundSessions[0].size){
                    foundSessions[0].status = "complete"
                    foundSessions[0] = sortSession(foundSessions[0]);
                    //sendFirebase(foundSessions[0]);
                    //Include the updated session status to the database update
                    var newvalues = {$set: {results: foundSessions[0].results, complete: newComplete, status: "complete"}}
                }
                else{
                    var newvalues = {$set: {results: foundSessions[0].results, complete: newComplete}}
                }
                foundSessions[0].complete++;    
                
                //Update database with new values
                db.collection(SESSION_COLLECTION).updateOne(query, newvalues, function(err,result){
                    if (err) res.status(400).send({"ok": false, "message": "Couldn't update session with values"});
                    else{
                        console.log(foundSessions[0]);
                        res.status(200).send({ok: true});
                    }
                })
                
            }
        })
    });

    //Adds a user to a session
    //TODO: FB authentication to find user??
    app.post('/session/:id/:userid/:username', auth.checkFB, function (req, res) {
        /* Get session matching ID */
        db.collection(SESSION_COLLECTION).findOne({"pin": req.params.id})
        .then((session) => {
            
            /* Get user matching the token that was authenticated */
            db.collection(USER_COLLECTION).findOne({"id": req.params.userid})
            .then((user) => {
                
                /* Add the user if they aren't in the session yet */
                var flag = false;
                for(i = 0; i < session.participants.length;i++){
                    if(session.participants[i].name == req.params.username) flag = true;
                }
                if (!flag) {
                    let newPerson = {"name": req.params.username, "id": req.params.userid};
                    let participants = session.participants;
                    participants.push(newPerson);
                    db.collection(SESSION_COLLECTION)
                    .updateOne({"pin": req.params.id}, {$set: {"participants": participants}})
                    .then(() => {
                        /* Update copy of session to be returned */
                        console.log(session);
                        /* Push firebase message to each user in the session */
                        sendFirebase(session);
                        res.status(201).send({"ok": true})
                    });
                }
                else {
                    res.status(400).send({"ok": false});
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({"ok" : false});
        })
    })

    //Starts and runs a session
    //TODO: FB authentication, check if user is creator of session
    app.put('session/:id', auth.checkFB, function(req, res){
        var query = {pin: req.params.id}
        //Find session
        db.collection(SESSION_COLLECTION).find(query).toArray(function(err, session){
            if(err) res.status(400).send({"ok": false, "message": "Session doesn't exist"});
            else{ 
                //Check if session is in lobby
                if(result[0].status == "lobby") {
                    var newvalues = {$set: {status: "running"}}
                    //Update session database
                    db.collection(SESSION_COLLECTION).updateOne(query, newvalues, function(err,result){
                        if (err) res.status(400).send({"ok": false, "message": "Couldn't update session"});
                        else{
                            //Respond to http request and send firebase notification
                            res.status(200).send({ok: true});
                            session[0].status = "running";
                            sendFirebase(session[0]);
                        }       
                    })
                }
                else{
                    res.status(400).send({"ok": false, "message": "Session has already started"})
                }
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

