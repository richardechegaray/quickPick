const express = require("express");
const { app } = require("firebase-admin");
const router = express.Router();

const ObjectId = require("mongodb").ObjectID;
const mongoUtil = require("../database/mongo");
const db = mongoUtil.getDb();

const auth = require("../middleware/authentication");

const firebaseUtil = require("../plugins/firebase");
/*
----------Helper functions
*/
//Random string helper
//Params: length, chars
//Returns: string
function randomString(length, chars) {
  var result = "";
  for (var i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/*
Helper function for sorting a sessions results
Parameters:
Returns:
*/
function sortSession(session) {
  var results = session.results;
  results.sort(function (a, b) {
    return b.score - a.score;
  });
  session.results = results;
  return session;
}

//--------Session requests
/*
Get session
Parameters: sessionID: req.params.pin
Returns: 200 if succesffuly, 400 if it doesn't exist
*/
router.get("/:pin", auth.checkFB, function (req, res) {
  console.log("DEBUG: Get request to /session/" + req.params.pin);
  let myPin = req.params.pin;

  db.collection(process.env.SESSION_COLLECTION)
    .find({ pin: myPin })
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send({ ok: false, message: "Session doesn't exist" });
      } else {
        res.status(200).send(result[0]);
      }
    });
});

/*
Create new session
Parameters: Size: req.body.size, FBToken: facebookToken
Returns: 400 if invalid parameters or session doesn't exist, 201 if successful
*/
router.post("/", auth.checkFB, function (req, res) {
  console.log("DEBUG: Post request to /session");
  let rString = randomString(
    5,
    "023456789abcdefghjkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ"
  );
  //TODO: Iterate through sessions until we have a unique pin

  db.collection(process.env.USER_COLLECTION)
    .findOne({ id: String(res.locals.id) })
    .then((user) => {
      //Assert user has logged in and parameters are valid
      if (
        user === null ||
        typeof res.locals.id !== "string" ||
        typeof req.body.size !== "number"
      ) {
        res.status(400).send({
          ok: false,
          message: "Invalid parameters",
        });
        return;
      }

      //Create session object
      let session = {
        pin: rString,
        listID: "",
        listName: "",
        status: "lobby",
        creator: String(res.locals.id),
        complete: 0,
        size: req.body.size,
        results: [],
        participants: [{ name: user.name, id: String(res.locals.id) }],
      };

      //Add to session collection
      db.collection(process.env.SESSION_COLLECTION).insertOne(
        session,
        function (err, result) {
          if (err) {
            res.status(400).send({
              ok: false,
              message: "Session couldn't be inserted into DB",
            });
            return;
          }
          res.status(201).send(session);
        }
      );
    });
});

/*
Endpoint to receive user choices for a session
Parameters:
Returns:
*/
router.post("/:id/choices", auth.checkFB, function (req, res) {
  console.log("DEBUG: post request to /session/" + req.params.id + "/choices");
  //Find session
  let query = { pin: req.params.id };
  db.collection(process.env.SESSION_COLLECTION).findOne(query, function (
    err,
    currentSession
  ) {
    //Assert session exists
    if (err || currentSession === null || typeof (req.body.choices) !== "object") {
      res.status(401).send({ ok: false, message: "Session doesn't exist or choices are invalid" });
      return;
    }
    //Iterate through session and see if user is in
    let isInSession = false;
    currentSession.participants.forEach(function (participantUser) {
      if (res.locals.id === participantUser.id) {
        isInSession = true;
      }
    });

    //Assert user is not in session
    if (!isInSession) {
      res
        .status(403)
        .send({ ok: false, message: "User ID is not in the session" });
      return;
    }

    //Iterate through responses, and also session to find idea names that match
    req.body.choices.forEach((choice) => {
      currentSession.results.forEach((result) => {
        //If they match and the response is positive, then increment the record
        if (choice.idea.name === result.idea.name && choice.choice) {
          result.score += 1;
        }
      });
    });

    //Push firebase notification if everyone has submitted their results
    let newComplete = currentSession.complete + 1;
    let newValues;
    if (newComplete === currentSession.participants.length) {
      currentSession.status = "complete";
      currentSession = sortSession(currentSession);
      let firebaseMessage = {
        session: currentSession,
      };
      firebaseUtil.sendFirebase(firebaseMessage);
      //Include the updated session status to the database update
      newValues = {
        $set: {
          results: currentSession.results,
          complete: newComplete,
          status: "complete",
        },
      };
    } else {
      newValues = {
        $set: { results: currentSession.results, complete: newComplete },
      };
    }
    currentSession.complete++;

    //Update database with new values
    db.collection(process.env.SESSION_COLLECTION).updateOne(
      query,
      newValues,
      function (err, result) {
        if (err) {
          res.status(402).send({
            ok: false,
            message: "Couldn't update session with values",
          });
          return;
        }
        res.status(200).send({ ok: true });
        return;
      }
    );
  });
});

/*
Adds a user to a session
Parameters: SessionID: req.params.id, FacebookToken
Returns: 400 or 201
*/
router.post("/:id", auth.checkFB, function (req, res) {
  console.log("DEBUG: Post request to /session/" + req.params.id);
  /* Get session matching ID */
  db.collection(process.env.SESSION_COLLECTION)
    .findOne({ pin: req.params.id })
    .then((session) => {
      //Assert session is found
      if (session == null) {
        console.log("No session exists with ID: " + req.params.id);
        res.status(400).send({ ok: false });
        return;
      }
      //Assert session has not started
      if (session.status !== "lobby") {
        console.log(
          "Session " +
          req.params.id +
          " is no longer accepting new participants"
        );
        res.status(400).send({ ok: false });
        return;
      }
      /* Get user matching the token that was authenticated */
      db.collection(process.env.USER_COLLECTION)
        .findOne({ id: String(res.locals.id) })
        .then((user) => {
          /* Add the user if they aren't in the session yet */
          session.participants.forEach(function (participantUser) {
            if (user.id === participantUser.id) {
              res.status(400).send({ ok: false });
              return;
            }
          });
          let newPerson = { name: user.name, id: String(res.locals.id) };
          let participants = session.participants;
          participants.push(newPerson);
          session.participants = participants;

          db.collection(process.env.SESSION_COLLECTION)
            .updateOne({ pin: req.params.id }, { $set: { participants } })
            .then(() => {
              /* Push firebase message to each user in the session */
              let firebaseMessage = {
                session
              };
              firebaseUtil.sendFirebase(firebaseMessage);
              res.status(201).send({ ok: true });
              return;
            });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ ok: false });
    });
});

/*
Starts and runs a session
Parameters: facebookToken: User's facebook token, req.params.id: ID of session to start
Returns: 400 if any asserts are not met, 200 if succesful
*/
router.post("/:id/run", auth.checkFB, function (req, res) {
  console.log("DEBUG: Post request to /session/" + req.params.id + "/run");
  let query = { pin: req.params.id };
  //Find session
  db.collection(process.env.SESSION_COLLECTION).findOne(query, function (
    err,
    session
  ) {
    //Assert session is found properly
    if (err || session === null) {
      console.log(err);
      res.status(400).send({ ok: false, message: "Session doesn't exist" });
      return;
    }
    //Assert user has rights to start
    if (session.creator !== String(res.locals.id)) {
      res.status(400).send({ ok: false, message: "User is not the creator" });
      return;
    }
    //Assert session is in lobby
    if (session.status !== "lobby") {
      res
        .status(400)
        .send({ ok: false, message: "Session has already started" });
      return;
    }
    //Assert session references a valid list
    if (session.listID === "" || typeof (session.listID) !== "string") {
      res.status(400).send({ ok: false, message: "Session contains an invalid list ID" });
      return;
    }
    let query = { _id: ObjectId(session.listID) };
    let newResults = [];
    db.collection(process.env.LISTS_COLLECTION).findOne(query, function (
      err,
      foundList
    ) {
      if (err) {
        res.status(400).send();
        return;
      }
      foundList.ideas.forEach((foundIdea) => {
        newResults.push({ idea: foundIdea, score: 0 });
      });

      session.status = "running";
      session.results = newResults;
      var newvalues = { $set: { status: "running", results: newResults } };
      //Update session database
      db.collection(process.env.SESSION_COLLECTION).updateOne(
        { pin: req.params.id },
        newvalues,
        function (err, result) {
          if (err) {
            res
              .status(400)
              .send({ ok: false, message: "Couldn't update session" });
            return;
          }
          //Respond to http request and send firebase notification
          res.status(200).send({ ok: true });
          var firebaseMessage = {
            session,
            "list": foundList,
          };
          firebaseUtil.sendFirebase(firebaseMessage);
          return;
        }
      );
    });
  });
});

/*
Updates the list for a session
Parameters:
Returns:
*/
router.put("/:id", auth.checkFB, function (req, res) {
  console.log("DEBUG: Put request to /session/" + req.params.id);
  //Assert parameters are valid
  if (req.params.id === null || req.body.listID === null) {
    res.status(400).send();
    return;
  }
  //TODO: Assert that session is in lobby
  let listName = ""
  db.collection(process.env.LISTS_COLLECTION).findOne({ _id: ObjectId(req.body.listID) }, function (err, foundList) {
    if (err) {
      res.status(400).send({ message: "Invalid list ID" });
      return;
    }
    listName = foundList.name;
    let newvalues = { $set: { listID: req.body.listID, listName } };

    db.collection(process.env.SESSION_COLLECTION).updateOne({ pin: req.params.id }, newvalues, function (err, result) {
      if (err) {
        res.status(400).send({ ok: false });
        return;
      }
      db.collection(process.env.SESSION_COLLECTION).findOne({ pin: req.params.id })
        .then((updatedSession) => {
          res.status(200).send(updatedSession);
          let fbMessage = {
            session: updatedSession
          }
          firebaseUtil.sendFirebase(fbMessage);
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send({ ok: false });
        })
    });
  });
});

module.exports = router;
