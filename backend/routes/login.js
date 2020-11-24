const express = require("express");
const router = express.Router();

const auth = require("../middleware/authentication");

const login = require("../helpers/loginhelper.js");

/* Creates/Updates the user corresponding to the facebook token
 * passed in the header */
router.post("/", auth.checkFB, login.putUser);

module.exports = router;