require('dotenv').config();
/*
---------Initialization
*/
//Initialize Firebase
var admin = require("firebase-admin");
// Path to secret
var serviceAccount = require("./quickpick-7f20f-firebase-adminsdk-hvb4p-96107c2f64.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
  });

//Initialize express
const app = require('express')()
const bodyParser = require('body-parser')
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

//Initialize mongodb
var MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(process.env.MONGOURL);

//Import Axios and Auth module for Facebook authentication
var axios = require('axios');
var auth = require("./middleware/authentication");


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
function sendFirebase(session, db){
    let idList = session.participants.map(u => u.id);
    db.collection(process.env.USER_COLLECTION)
    .find({"id": {$in: idList} })
    .project({"firebaseToken": true})
    .toArray()
    .then((tokens) => {
        let msgData = {"type": "session", "session": JSON.stringify(session)};
        let msg = { "data": msgData, 
                    "tokens": tokens.map(t => t.firebaseToken)};
        admin.messaging().sendMulticast(msg)
        .then((response) => {
            console.log(response.successCount + ' messages were sent successfully'); 
        });
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
    const db = client.db(process.env.DBNAME)

    //--------User requests
    app.post("/login", auth.checkFB, function(req, res, next) {
        console.log("DEBUG: Post request to login");
        let db = client.db("quickpick");
        /* Check users collection for document with matching FB id */ 
        db.collection(process.env.USER_COLLECTION).findOne({id: String(res.locals.id)})
        .then((mydoc) => {
            /* If a user in the DB has a matching id */
            if (mydoc != null) {
                if (req.body.firebaseToken != mydoc.firebaseToken) {
                    db.collection(process.env.USER_COLLECTION)
                    .updateOne(
                        {id: String(res.locals.id)}, 
                        {$set: { 'firebaseToken': String(req.body.firebaseToken)}})
                    .then(() => {
                        console.log("Verified user, updated FB token");
                        res.json({ "ok": true});
                    })
                }
                else {
                    console.log("Verified user, FB token didn't need to be updated");
                    res.json({ "ok": true});               
                }
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
                .catch(err => {
                    console.log(err);
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
    app.get('/lists', auth.checkFB, function (req, res) {
        console.log("DEBUG: Get request to lists");
        db.collection(process.env.LISTS_COLLECTION).find({}).toArray(function(err, result){
            if(err) res.status(400).send({"ok": false, "message": "Couldn't retrieve lists"});
            else {
                res.status(200).send(result);
            }
        })
    });

    //--------Session requests
    //Get session
    app.get('/session:id', auth.checkFB, function (req, res) {
        console.log("DEBUG: Get request to /session/" + req.params.id);
        var o_id = new mongo.ObjectID(req.params.id);

        db.collection(process.env.SESSION_COLLECTION).find({_id : o_id}).toArray(function(err, result){
            if (err) res.status(400).send({"ok": false, "message": "Session doesn't exist"});
            else res.status(200).send(result[0]);
        })
    });

    //Create new session
    app.post('/session', auth.checkFB, function (req, res) {
        console.log("DEBUG: Post request to /session");
        var rString = randomString(5, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        var count;
        //TODO: Iterate through sessions until we have a unique pin
       
        var name = "";
        db.collection(process.env.USER_COLLECTION).findOne({"id": String(res.locals.id)})
            .then((user) => {
                if (user != null) {
                    name = user.name;
                }
                else {
                    res.status(400).send({"ok": false, "message": "UserID Invalid / User has not logged in before"});
                }
            
        //Create session object
        var session= {
            "pin": rString,
            "list":/* req.body.list,*/ {"name": "Movie Genres", "ideas": [{"name": "Horror", "description":"For those that want to tremble", "picture": "https://ca-times.brightspotcdn.com/dims4/default/52ce001/2147483647/strip/true/crop/2045x1150+0+0/resize/1486x836!/quality/90/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fa5%2F5d%2Ffffe5dd7df3c47bcdabc16fc2d9a%2Fla-1539995022-xl6x2n389a-snap-image"}, 
            {'name': 'Comedy', "description": "For those that want to laugh", "picture":"https://i.insider.com/5aa97b4f3be59f2a008b465f?width=1100&format=jpeg&auto=webp"}, 
            {'name': 'Action',"description": "For those that like explosions", "picture": "https://i.insider.com/5b560e9657a20723008b45ab?width=600&format=jpeg&auto=webp"}, 
            {"name": "Crime", "description": "For those that want suspense", "picture": "https://i0.wp.com/decider.com/wp-content/uploads/2017/03/the-godfather.jpg?quality=80&strip=all&ssl=1"},
            {"name": "Romance", "description":"For those that want to cry", "picture": "https://www.altfg.com/film/wp-content/uploads/images/robert-pattinson-kristen-stewart-edward-bella-kissing-eclipse.jpg.webp"}, 
            {"name": "Christmas", "description": "For those who can't get enough of christmas", "picture": "https://d1qxviojg2h5lt.cloudfront.net/images/01DWJWFNMRRFQY2Z9JFEV7NEYS/thegrinch570.png"}]}, //TODO: not hardcoded list
            "status": "lobby",
            "creator": String(res.locals.id),
            "complete": 0,
            "size": req.body.size,
            "results": [],
            "participants": [{"name": name, "id": String(res.locals.id)}],   
        }
        //Create results array with 0 counts
        var resultArray = []
        for(i = 0; i < session.list.ideas.length; i++){
            var jsonVar = {"idea": session.list.ideas[i],"score": 0}
            resultArray.push(jsonVar);
        }
        session.results = resultArray;       
        db.collection(process.env.SESSION_COLLECTION).insertOne(session, function(err, result) {
            if (err) res.status(400).send({ok: false, "message": "Session couldn't be inserted into DB"});
            else res.status(201).send(session);
          }); 
        });
    });

    //Endpoint to receive user choices for a session
    //TODO: Error handling
    app.post('/session/:id/choices', auth.checkFB, function (req, res) {
        console.log("DEBUG: post request to /session/" + req.params.id + "/choices");
        var query = {"pin": req.params.id}
        db.collection(process.env.SESSION_COLLECTION).find(query).toArray(function(err, foundSessions){

            //See if user is in session
            var isInSession = false;
            for(i = 0; i< foundSessions[0].participants.length; i++){
                if(String(res.locals.id) == foundSessions[0].participants[i].id){
                    isInSession = true;
                }
            }
            if(err || foundSessions.length == 0){
                res.status(401).send({"ok": false, "message": "Session doesn't exist"});
            }
            else if(isInSession){
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
                if(newComplete == foundSessions[0].participants.length){
                    foundSessions[0].status = "complete"
                    foundSessions[0] = sortSession(foundSessions[0]);
                    sendFirebase(foundSessions[0],db);
                    //Include the updated session status to the database update
                    var newvalues = {$set: {results: foundSessions[0].results, complete: newComplete, status: "complete"}}
                }
                else{
                    var newvalues = {$set: {results: foundSessions[0].results, complete: newComplete}}
                }
                foundSessions[0].complete++;    
                
                //Update database with new values
                db.collection(process.env.SESSION_COLLECTION).updateOne(query, newvalues, function(err,result){
                    if (err) res.status(402).send({"ok": false, "message": "Couldn't update session with values"});
                    else{

                        res.status(200).send({ok: true});
                    }
                })
                
            }
            else{
                res.status(403).send({"ok": false, "message": "User ID is not in the session"})
            }
        })
    });

    //Adds a user to a session
    //TODO: Error handling in case id does not exist
    app.post('/session/:id', auth.checkFB, function (req, res) {
        console.log("DEBUG: Post request to /session/" + req.params.id);
        /* Get session matching ID */
        db.collection(process.env.SESSION_COLLECTION).findOne({"pin": req.params.id})
        .then((session) => {
            if (session == null) {
                console.log("No session exists with ID: " + req.params.id);
                res.status(400).send({"ok": false});
            }
            else if (session.status != "lobby") {
                console.log("Session " + req.params.id + " is no longer accepting new participants");
                res.status(400).send({"ok": false});
            }
            else {
                /* Get user matching the token that was authenticated */
                db.collection(process.env.USER_COLLECTION).findOne({"id": String(res.locals.id)})
                .then((user) => {
                    
                    /* Add the user if they aren't in the session yet */
                    var flag = false;
                    for(i = 0; i < session.participants.length;i++){
                        if(user.id == session.participants[i].id) flag = true;
                    }
                    if (!flag) {
                        let newPerson = {"name": user.name, "id": String(res.locals.id)};
                        let participants = session.participants;
                        participants.push(newPerson);
                        db.collection(process.env.SESSION_COLLECTION)
                        .updateOne({"pin": req.params.id}, {$set: {"participants": participants}})
                        .then(() => {
                            /* Push firebase message to each user in the session */
                            sendFirebase(session, db);
                            res.status(201).send({"ok": true})
                        });
                    }
                    else {
                        res.status(400).send({"ok": false});
                    }
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({"ok" : false});
        })
    })

    //Starts and runs a session
    //TODO: FB authentication, check if user is creator of session
    app.post('/session/:id/run', auth.checkFB, function(req, res){
        console.log("DEBUG: Post request to /session/" + req.params.id + "/run");
        var query = {"pin": req.params.id}
        //Find session
        db.collection(process.env.SESSION_COLLECTION).find(query).toArray(function(err, session){
            if(err){ 
                console.log(err);
                res.status(400).send({"ok": false, "message": "Session doesn't exist"});
            }
            else if(session[0].creator != String(res.locals.id)) {
                res.status(400).send({"ok": false, "message": "User is not the creator"});
            }
            else{ 
                //Check if session is in lobby
                if(session[0].status == "lobby") {
                    var newvalues = {$set: {status: "running"}}
                    //Update session database
                    db.collection(process.env.SESSION_COLLECTION).updateOne(query, newvalues, function(err,result){
                        if (err) res.status(400).send({"ok": false, "message": "Couldn't update session"});
                        else{
                            //Respond to http request and send firebase notification
                            res.status(200).send({ok: true});
                            session[0].status = "running";
                            sendFirebase(session[0], db);
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

    var server = app.listen(process.env.PORT, function() {
        var host = server.address().address;
        var port = server.address().port;
        console.log("Listening at http://%s:%s", host, port);
    });
});

