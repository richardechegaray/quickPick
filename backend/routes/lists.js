const express = require("express");
const router = express.Router();

const mongoUtil = require("../database/mongo");
var db = mongoUtil.getDb();

const auth = require("../middleware/authentication");
const loginHelper = require("../helpers/loginhelper");
const imgUtil = require("../plugins/unsplash");

/* Returns all lists where the userID field matches the user making the request */
router.get("/", auth.checkFB, async function (req, res) {
    console.log("DEBUG: Get request to lists");
    try {
        const myLists = await db.collection(process.env.LISTS_COLLECTION)
            .find({ userID: res.locals.id }).toArray();

        let listResponseObj = { lists: [] };

        myLists.forEach((ideaList) => {
            listResponseObj.lists.push(ideaList);
        });

        res.status(200).send(listResponseObj);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({});
    }
});

/*  */
router.post("/", auth.checkFB, async function (req, res) {
    console.log("DEBUG: Post request to lists");
    let newList = req.body.list;

    /* newList cannot be null*/
    if (newList === null) {
        console.log("DEBUG: List in body is null");
        res.status(400).send({});
    }
    else {
        try {
            /* Add an image url to each idea on the list */
            for (let i = 0; i < newList.ideas.length; i++) {
                let imgUrl = await imgUtil.getImage(newList.ideas[i].name);
                newList.ideas[i].picture = imgUrl;
            }
            /* Set user making request as the list's owner */
            newList.userID = res.locals.id;

            await db.collection(process.env.LISTS_COLLECTION).insertOne(newList);
            res.status(201).send(newList);
        }
        catch (err) {
            console.log(err);
            res.status(500).send({});
        }
    }
});

/* Finds a list matching the id and returns it if the the list belongs to the user */
router.get("/:id", auth.checkFB, async function (req, res) {
    console.log("DEBUG: Get request to lists");
    try {
        /* Find the list matching the id */
        const myList = await db.collection(process.env.LISTS_COLLECTION)
            .findOne({ _id: req.params.id });

        if (myList == null) {
            console.log(`DEBUG: Did not find a list matching _id: ${req.params.id}`);
            res.status(404).send({});
        }
        else if (myList.userID !== res.locals.id) {
            console.log("DEBUG: Attempted to access another user's list");
            res.status(403).send({});
        }
        else {
            res.status(200).send(myList);
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).send({});
    }
});

module.exports = router;