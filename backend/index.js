var express = require("express");
var app = express();
var axios = require('axios');
var auth = require("./middleware/authentication");
require('dotenv').config();

var MongoClient = require('mongodb').MongoClient;
var dburl = 'mongodb://localhost:27017';

app.use(express.json());

app.get("/", function(req, res) {
    res.json({ "message": 'Ello sir',
                    "ok": true });
})
app.post("/login", auth.checkFB, function(req, res, next) {

    MongoClient.connect(dburl, function(err, client) {
        let db = client.db("quickpick")
        console.log(db.collection('users').find());
        if (db.collection('users').find() //{ "id": String(res.locals.id)}, {id: 1}
            .count() > 0) {
            console.log("User already exists in database. Will not create.")
            res.json({ "message": "Successfully verified existing user",
                            "ok": true });
        }
        else {
            console.log("User does not exist in database. Creating...")
            // Get user's name
            let url = `https://graph.facebook.com/v8.0/${res.locals.id}?access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`
            axios.get(url)
            .then(fb_response => {
                console.log(fb_response.data);
                let name = fb_response.data.name;
            
                // Create new user
                db.collection('users').insertOne(
                    { 
                        "id": String(res.locals.id), 
                        "name": String(name)
                    });
                res.json({ "message": "Created a new user",
                                "ok": true });
            })
            .catch(err => {
                console.log(err);
            })
        }
    })
});

var server = app.listen(8081, function() {
            var port = server.address().port;
            console.log("Listening at %s", port);
        });
