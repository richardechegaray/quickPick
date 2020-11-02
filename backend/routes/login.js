const express = require("express");
const router = express.Router();

const mongoUtil = require("../database/mongo");
const db = mongoUtil.getDb();

const axios = require("axios");
const auth = require("../middleware/authentication");

const login = require("../helpers/loginhelper.js");

//--------User requests
router.post("/", auth.checkFB, function (req, res, next) {
    login.loginHelper(res.locals.id, req.body.firebaseToken, res, sendRes);  
})


function sendRes(res, status, data){
    res.status(status).send(data);
}

module.exports = router;