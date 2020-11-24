const express = require("express");
const router = express.Router();

const auth = require("../middleware/authentication");
const { catchErrors } = require("../middleware/error-middleware");

const listController = require("../controllers/list");

/* Returns all lists where the userID field matches the user making the request */
router.get("/", auth.checkFB, catchErrors(listController.getMyLists));

/* Takes the list from the request body and puts it into the DB */
router.post("/", auth.checkFB, catchErrors(listController.createList));

/* Finds a list matching the id and returns it if the the list belongs to the user */
router.get("/:id", auth.checkFB, catchErrors(listController.getList));

module.exports = router;