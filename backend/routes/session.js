const express = require("express");
const router = express.Router();

const auth = require("../middleware/authentication");
const { catchErrors } = require("../middleware/error-middleware");

const sessionController = require("../controllers/session");

/* Returns the session as a JSON */
router.get("/:id", auth.checkFB, catchErrors(sessionController.getSession));

/* Creates a session and returns it as a JSON */
router.post("/", auth.checkFB, catchErrors(sessionController.createSession));

/* Receives a users choices for a session */
router.post("/:id/choices", auth.checkFB, catchErrors(sessionController.receiveChoices));

/* Adds a user to a session */
router.post("/:id", auth.checkFB, catchErrors(sessionController.addUser));

/* Starts a session */
router.post("/:id/run", auth.checkFB, catchErrors(sessionController.startSession));

/* Updates the chosen list for a session */
router.put("/:id", auth.checkFB, catchErrors(sessionController.updateList));

/* Returns the list for a session */
router.get("/:id/list", auth.checkFB, catchErrors(sessionController.getList));


module.exports = router;