const express = require("express");
const router = express.Router();

const mongoUtil = require("../database/mongo");
var db = mongoUtil.getDb();

const auth = require("../middleware/authentication");
const loginHelper = require("../helpers/loginhelper");
const imgUtil = require("../plugins/unsplash");

router.get("/", auth.checkFB, async function (req, res) {
    console.log("DEBUG: Get request to lists");
    try {
        const myLists = await db.collection(process.env.LISTS_COLLECTION)
        .find({ userID: res.locals.id }).toArray();
        console.log(myLists);
        let listResponseObj = {};
        let count = 1;
        
        myLists.forEach((doc) => {
            listResponseObj[String(count)] = doc;
            count++;
        });
        listResponseObj.ok = true;
        res.status(200).send(listResponseObj);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ "ok": false });
    }
});

router.post("/", auth.checkFB, async function (req, res) {
    console.log("DEBUG: Post request to lists");
    let newList = req.body.list;
    try {

        for (let i = 0; i < newList.ideas.length; i++) {
            let imgUrl = await imgUtil.getImage(newList.ideas[i].name);
            // Right now we only return one image
            newList.ideas[i].picture = imgUrl; 
        }

        newList.userID = res.locals.id;
        await db.collection(process.env.LISTS_COLLECTION).insertOne(newList);
        res.status(201).send({ "ok": true });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ "ok": false });
    }
});

module.exports = router;