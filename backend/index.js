var express = require("express");
var app = express();
var axios = require('axios');
var auth = require("./middleware/authentication");
require('dotenv').config();

var MongoClient = require('mongodb').MongoClient;
var dburl = 'mongodb://localhost:27017';

app.use(express.json());

app.post("/login", auth.checkFB, function(req, res, next) {
    MongoClient.connect(dburl, function(err, client) {
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
                            "name": String(fb_response.data.name)
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
});

var server = app.listen(8081, function() {
            var port = server.address().port;
            console.log("Listening at %s", port);
        });
