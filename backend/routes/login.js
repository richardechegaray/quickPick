const express = require("express");
const router = express.Router();

const mongoUtil = require("../database/mongo");
const db = mongoUtil.getDb();

const axios = require("axios");
const auth = require("../middleware/authentication");

//--------User requests
router.post("/", auth.checkFB, function (req, res, next) {
    console.log("DEBUG: Post request to login");
    /* Check users collection for document with matching FB id */
    db.collection(process.env.USER_COLLECTION).findOne({ id: String(res.locals.id) })
        .then((mydoc) => {
            /* If a user in the DB has a matching id */
            if (mydoc !== null) {
                if (req.body.firebaseToken != mydoc.firebaseToken) {
                    db.collection(process.env.USER_COLLECTION)
                        .updateOne(
                            { id: String(res.locals.id) },
                            { $set: { "firebaseToken": String(req.body.firebaseToken) } })
                        .then(() => {
                            console.log("Verified user, updated FB token");
                            res.json({ "ok": true });
                        });
                }
                else {
                    console.log("Verified user, FB token didn't need to be updated");
                    res.json({ "ok": true });
                }
            }
            else {
                /* Get user's name */
                let url = `https://graph.facebook.com/v8.0/${res.locals.id}?access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`;
                axios.get(url)
                    .then(facebookResponse => {
                        /* Create new user */
                        db.collection("users").insertOne(
                            {
                                "id": String(res.locals.id),
                                "name": String(facebookResponse.data.name),
                                "firebaseToken": String(req.body.firebaseToken)
                            });
                        res.json({
                            "message": "Successfully created a new user",
                            "ok": true
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500);
            res.json({
                "message": "Error during authentication",
                "ok": false
            })
        });
})

module.exports = router;