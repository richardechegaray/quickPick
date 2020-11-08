const express = require("express");
const router = express.Router();

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

//Helper function for sorting a sessions results
function sortSession(session) {
  var results = session.results;
  results.sort(function (a, b) {
    return b.score - a.score;
  });
  session.results = results;
  return session;
}

//--------Session requests
//Get session
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

//Create new session
router.post("/", auth.checkFB, function (req, res) {
  console.log("DEBUG: Post request to /session");
  let rString = randomString(
    5,
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  );
  let count;
  //TODO: Iterate through sessions until we have a unique pin

  let name = "";
  db.collection(process.env.USER_COLLECTION)
    .findOne({ id: String(res.locals.id) })
    .then((user) => {
      if (user != null) {
        name = user.name;
      } else {
        res.status(400).send({
          ok: false,
          message: "UserID Invalid / User has not logged in before",
        });
      }

      //Create session object
      let session = {
        pin: rString,
        listID: "",
        status: "lobby",
        creator: String(res.locals.id),
        complete: 0,
        size: req.body.size,
        results: [],
        participants: [{ name, id: String(res.locals.id) }],
      };
      //Create results array with 0 counts
      let resultArray = [];
      session.list.ideas.forEach((idea) => {
        resultArray.push({ idea, score: 0 });
      });
      session.results = resultArray;
      db.collection(process.env.SESSION_COLLECTION).insertOne(
        session,
        function (err, result) {
          if (err) {
            res.status(400).send({
              ok: false,
              message: "Session couldn't be inserted into DB",
            });
          } else {
            res.status(201).send(session);
          }
        }
      );
    });
});

//Endpoint to receive user choices for a session
//TODO: Error handling
router.post("/:id/choices", auth.checkFB, function (req, res) {
  console.log("DEBUG: post request to /session/" + req.params.id + "/choices");
  let query = { pin: req.params.id };
  db.collection(process.env.SESSION_COLLECTION)
    .find(query)
    .toArray(function (err, foundSessions) {
      if (err || foundSessions.length === 0) {
        res.status(401).send({ ok: false, message: "Session doesn't exist" });
      }
      //See if user is in session
      let isInSession = false;
      let currentSession = foundSessions[0];
      currentSession.participants.forEach(function (participantUser) {
        if (res.locals.id === participantUser.id) {
          isInSession = true;
        }
      });

      if (isInSession) {
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
            type: "session",
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
            } else {
              res.status(200).send({ ok: true });
            }
          }
        );
      } else {
        res
          .status(403)
          .send({ ok: false, message: "User ID is not in the session" });
      }
    });
});

//Adds a user to a session
//TODO: Error handling in case id does not exist
router.post("/:id", auth.checkFB, function (req, res) {
  console.log("DEBUG: Post request to /session/" + req.params.id);
  /* Get session matching ID */
  findSession(req.params.id, function (err, session) {
    //Assert there is no error finding the session
    if (err) {
      console.log(err);
      res.status(500).send({ ok: false });
    } 
    //Assert session is valid
    else if (session == null) {
      console.log("No session exists with ID: " + req.params.id);
      res.status(400).send({ ok: false });
    } 
    //Assert session is in lobby
    else if (session.status !== "lobby") {
      console.log(
        "Session " + req.params.id + " is no longer accepting new participants"
      );
      res.status(400).send({ ok: false });
    } 
    else {
      /* Get user matching the token that was authenticated */
      db.collection(process.env.USER_COLLECTION)
        .findOne({ id: String(res.locals.id) })
        .then((user) => {
          /* Iterate through users and see if they are already in the session */
          let flag = false;
          session.participants.length.forEach(function (participantUser) {
            if (user.id === participantUser.id) {
              flag = true;
            }
          });
          if (!flag) {
            //Add participant
            let newPerson = { name: user.name, id: String(res.locals.id) };
            let participants = session.participants;
            participants.push(newPerson);
            let newvalues = { $set: { participants } };
            //Update session
            updateSession(req.params.pid, newvalues, function (err, result) {
              if (err) {
                res.status(400).send({ message: "Couldn't update database" });
              } else {
                let firebaseMessage = {
                  type: "session",
                  session: result,
                };
                firebaseUtil.sendFirebase(firebaseMessage);
                res.status(201).send({ ok: true });
              }
            });
          } else {
            res.status(400).send({ message: "User is already in the session" });
          }
        });
    }
  });
});

//Starts and runs a session
router.post("/:id/run", auth.checkFB, function (req, res) {
  console.log("DEBUG: Post request to /session/" + req.params.id + "/run");

  //Find session
  findSession(req.params.id, function (err, session) {
    //Assert session is found
    if (err) {
      console.log(err);
      res.status(400).send({ ok: false, message: "Session doesn't exist" });
    }
    //Assert user is creator
    else if (session.creator !== String(res.locals.id)) {
      res.status(400).send({ ok: false, message: "User is not the creator" });
    } else {
      //Check if session is in lobby
      if (session.status === "lobby") {
        var newvalues = { $set: { status: "running" } };
        //Update session database
        updateSession(req.params.id, newvalues, function (err, result) {
          if (err) {
            res
              .status(400)
              .send({ ok: false, message: "Couldn't update session" });
          } else {
            //Respond to http request and send firebase notification
            findList(session.listID, function (err, foundList) {
              if (err) {
                res
                  .status(400)
                  .send({ message: "Could not find list for session" });
              } else {
                let firebaseMessage = {
                  type: "list",
                  session: result,
                  list: foundList,
                };
                res.status(200).send({ ok: true });
                firebaseUtil.sendFirebase(firebaseMessage);
              }
            });
          }
        });
      } else {
        res
          .status(400)
          .send({ ok: false, message: "Session has already started or ended" });
      }
    }
  });
});

/*
End point that updates the list for a session
*/
router.put("/:id", auth.checkFB, function (req, res) {
  //Assert listID isn't null
  if(req.body.listID == null){
    res.status(400).send({message: "List ID not valid"});
  }
  else{
    let newvalues = {$set: {listID: req.body.listID}};
    updateSession(req.params.id, newvalues, function(err, result){
      if(err){
        res.status(400).send({message: "Error updating sesson"});
      }
      else{
        res.status(200).send({message: "Sucessfully updated session"});
      }
    })
  }
});

function findSession(id, callback) {
  var query = { pin: id };
  db.collection(process.env.SESSION_COLLECTION).findOne(query, function (
    err,
    session
  ) {
    if (err) {
      callback(true, 0);
    } else {
      callback(false, session);
    }
  });
}

function updateSession(id, newvalues, callback) {
  var query = { pin: id };
  db.collection(process.env.SESSION_COLLECTION).updateOne(
    query,
    newvalues,
    function (err, result) {
      if (err) {
        callback(true, 0);
      } else {
        callback(false, result);
      }
    }
  );
}

function findList(id, callback) {
  var query = { _id: id };
  db.collection(process.env.LIST_COLLECTION).updateOne(query, function (
    err,
    result
  ) {
    if (err) {
      callback(true, 0);
    } else {
      callback(false, result);
    }
  });
}
module.exports = router;
