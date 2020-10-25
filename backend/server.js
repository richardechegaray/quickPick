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
const app = require('express')()
const bodyParser = require('body-parser')
const multer = require('multer') // v1.0.5
const upload = multer() // for parsing multipart/form-data

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

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
        var o_id = new mongo.ObjectID(req.params.id);

        db.collection(SESSION_COLLECTION).find({_id : o_id}).toArray(function(err, result){
            if (err) res.status(400).send({"ok": false});
            else res.status(200).send({"session": result.ops, "ok": true});
        })
    });

    //Create new session
    //TODO: FB Authentication, add creator to participants
    app.post('/session', function (req, res) {
        var rString = randomString(5, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        var count;
        //TODO: Iterate through sessions until we have a unique pin
       
        //Create session object
        var session= {
            "pin": rString,
            "list": {"name": "Movie Genres", "ideas": [{"name": "Horror"}, {'name': 'Comedy'}, {'name': 'Action'}]}, //TODO: not hardcoded list
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
        res.status(201).send({"ok":true, "session": session});
    });

    //Endpoint to receive user choices for a session
    //TODO: FB Authentication, receive choices, check if done if it is then push firebase notification
    app.post('/session/:id/choices', function (req, res) {
        var query = {pin: req.params.id}
        db.collection(SESSION_COLLECTION).find(query).toArray(function(err, foundSessions){
            if(err || foundSessions.length == 0){
                res.status(400).send({"ok": false});
            }
            else{
                //Iterate through responses, and also session to find idea names that match
                for(i = 0; i < req.body.choices.length; i++){
                    for(j = 0; j < foundSessions[0].results.length; j++){

                        //If they match and the response is positive, then increment the record
                        if(req.body.choices[i].idea.name == foundSessions[0].results[j].idea.name && req.body.choices[i].choice){
                            var count = foundSessions[0].results[j].score + 1;
                            console.log(count)
                            foundSessions[0].results[j].score = count;
                        }
                    }
                }

                var newComplete = foundSessions[0].complete + 1;
                var newvalues = {$set: {results: foundSessions[0].results, complete: newComplete}}
                
                //Update database with new values
                db.collection(SESSION_COLLECTION).updateOne(query, newvalues, function(err,result){
                    if (err) res.status(400).send({"ok": false});
                    else{
                        res.status(200).send({ok: true});
                    }
                })
                //Push firebase notification if everyone has submitted their results
                if(newComplete == foundSessions[0].size){
                    //TODO: Firebase notification
                }
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

