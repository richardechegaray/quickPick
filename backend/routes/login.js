const express = require("express");
const router = express.Router();

const auth = require("../middleware/authentication");

const login = require("../helpers/loginhelper.js");

//--------User requests

function sendRes(res, status, data){
    res.status(status).send(data);
}

router.post("/", auth.checkFB, function (req, res, next) {
    login.loginHelper(res.locals.id, req.body.firebaseToken, res, sendRes);  
});




module.exports = router;