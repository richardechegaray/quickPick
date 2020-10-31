const express = require('express');
const router = express.Router();

const mongoUtil = require('../database/mongo');
var db = mongoUtil.getDb();

const auth = require("../middleware/authentication");

//--------List requests
//Get the lists a user has access to
router.get('/', auth.checkFB, function (req, res) {
    console.log("DEBUG: Get request to lists");
    db.collection(process.env.LISTS_COLLECTION).find({}).toArray(function (err, result) {
        if (err) res.status(400).send({ "ok": false, "message": "Couldn't retrieve lists" });
        else {
            res.status(200).send(result);
        }
    })
});

module.exports = router;