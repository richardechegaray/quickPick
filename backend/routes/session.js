const express = require("express");
const router = express.Router();

const auth = require("../middleware/authentication");

const sessionHelper = require("../helpers/sessionhelper");

router.get("/:id", auth.checkFB, sessionHelper.getSession);

router.post("/", auth.checkFB, sessionHelper.createSession);

router.post("/:id/choices", auth.checkFB, sessionHelper.receiveChoices);

router.post("/id", auth.checkFB, sessionHelper.addUser);

router.post("/:id/run", auth.checkFB, sessionHelper.startSession);

router.put("/:id", auth.checkFB, sessionHelper.updateList);

router.get("/:id/list", auth.checkFB, sessionHelper.getList);


module.exports = router;