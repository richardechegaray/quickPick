const express = require("express");
const router = express.Router();

const auth = require("../middleware/authentication");

const sessionController = require("../controllers/session");

/* Returns the session as a JSON */
router.get("/:id", auth.checkFB, sessionController.getSession);

/* Creates a session and returns it as a JSON */
router.post("/", auth.checkFB, sessionController.createSession);

/* Receives a users choices for a session */
router.post("/:id/choices", auth.checkFB, sessionController.receiveChoices);

/* Adds a user to a session */
router.post("/:id", auth.checkFB, sessionController.addUser);

/* Starts a session */
router.post("/:id/run", auth.checkFB, sessionController.startSession);

/* Updates the chosen list for a session */
router.put("/:id", auth.checkFB, sessionController.updateList);

/* Returns the list for a session */
router.get("/:id/list", auth.checkFB, sessionController.getList);


module.exports = router;