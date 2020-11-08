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

//Checks if User is in the session
function isInSession(userID, session) {
  let present = false;
  session.participants.forEach((participant) => {
    if (String(userID) === String(participant.id)) {
      present = true;
    }
  });
  return present;
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
        res
          .status(400)
          .send({
            ok: false,
            message: "UserID Invalid / User has not logged in before",
          });
      }

      //Create session object
      let session = {
        pin: rString,
        list: {"name":"Group Activities","ideas":[{"name":"Cards","description":"Let's play some Go Fish","picture":"https://images.unsplash.com/photo-1556195332-95503f664ced?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE4MDM0OH0"},{"name":"Alcohol","description":"You cared about me when no one else would","picture":"https://images.unsplash.com/photo-1527281400683-1aae777175f8?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE4MDM0OH0"},{"name":"Sleep","description":"yeah...","picture":"https://images.unsplash.com/photo-1519003300449-424ad0405076?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE4MDM0OH0"},{"name":"Biking","description":"Bikes are cool","picture":"https://images.unsplash.com/photo-1594058573823-d8edf1ad3380?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE4MDM0OH0"}],"userID":"3591549284238798"},
        // list: /* req.body.list,*/ {
        //   name: "Movie Genres",
        //   ideas: [
        //     {
        //       name: "Horror",
        //       description: "For those that want to tremble",
        //       picture:
        //         "https://ca-times.brightspotcdn.com/dims4/default/52ce001/2147483647/strip/true/crop/2045x1150+0+0/resize/1486x836!/quality/90/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Fa5%2F5d%2Ffffe5dd7df3c47bcdabc16fc2d9a%2Fla-1539995022-xl6x2n389a-snap-image",
        //     },
        //     {
        //       name: "Comedy",
        //       description: "For those that want to laugh",
        //       picture:
        //         "https://i.insider.com/5aa97b4f3be59f2a008b465f?width=1100&format=jpeg&auto=webp",
        //     },
        //     {
        //       name: "Action",
        //       description: "For those that like explosions",
        //       picture:
        //         "https://i.insider.com/5b560e9657a20723008b45ab?width=600&format=jpeg&auto=webp",
        //     },
        //     {
        //       name: "Crime",
        //       description: "For those that want suspense",
        //       picture:
        //         "https://i0.wp.com/decider.com/wp-content/uploads/2017/03/the-godfather.jpg?quality=80&strip=all&ssl=1",
        //     },
        //     {
        //       name: "Romance",
        //       description: "For those that want to cry",
        //       picture:
        //         "https://www.altfg.com/film/wp-content/uploads/images/robert-pattinson-kristen-stewart-edward-bella-kissing-eclipse.jpg.webp",
        //     },
        //     {
        //       name: "Christmas",
        //       description: "For those who can't get enough of christmas",
        //       picture:
        //         "https://d1qxviojg2h5lt.cloudfront.net/images/01DWJWFNMRRFQY2Z9JFEV7NEYS/thegrinch570.png",
        //     },
        // ],
        // }, //TODO: not hardcoded list
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
            res
              .status(400)
              .send({
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
      let currentSession = foundSessions[0];

      //See if user is in session
      if (isInSession(res.locals.id, currentSession)) {
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
          firebaseUtil.sendFirebase(currentSession);
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
              res
                .status(402)
                .send({
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
  db.collection(process.env.SESSION_COLLECTION)
    .findOne({ pin: req.params.id })
    .then((session) => {
      if (session == null) {
        console.log("No session exists with ID: " + req.params.id);
        res.status(400).send({ ok: false });
      } else if (session.status !== "lobby") {
        console.log(
          "Session " +
            req.params.id +
            " is no longer accepting new participants"
        );
        res.status(400).send({ ok: false });
      } else {
        /* Get user matching the token that was authenticated */
        db.collection(process.env.USER_COLLECTION)
          .findOne({ id: String(res.locals.id) })
          .then((user) => {
            /* Add the user if they aren't in the session yet */
            let flag = false;
            session.participants.length.forEach(function (participantUser) {
              if (user.id === participantUser.id) {
                flag = true;
              }
            });
            if (!flag) {
              let newPerson = { name: user.name, id: String(res.locals.id) };
              let participants = session.participants;
              participants.push(newPerson);
              db.collection(process.env.SESSION_COLLECTION)
                .updateOne({ pin: req.params.id }, { $set: { participants } })
                .then(() => {
                  /* Push firebase message to each user in the session */
                  firebaseUtil.sendFirebase(session);
                  res.status(201).send({ ok: true });
                });
            } else {
              firebaseUtil.sendFirebase(session);
              res.status(201).send({ ok: true });
            }
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ ok: false });
    });
});

//Starts and runs a session
//TODO: FB authentication, check if user is creator of session
router.post("/:id/run", auth.checkFB, function (req, res) {
  console.log("DEBUG: Post request to /session/" + req.params.id + "/run");
  var query = { pin: req.params.id };
  //Find session
  db.collection(process.env.SESSION_COLLECTION)
    .find(query)
    .toArray(function (err, session) {
      if (err) {
        console.log(err);
        res.status(400).send({ ok: false, message: "Session doesn't exist" });
      } else if (session[0].creator !== String(res.locals.id)) {
        res.status(400).send({ ok: false, message: "User is not the creator" });
      } else {
        //Check if session is in lobby
        if (session[0].status === "lobby") {
          var newvalues = { $set: { status: "running" } };
          //Update session database
          db.collection(process.env.SESSION_COLLECTION).updateOne(
            query,
            newvalues,
            function (err, result) {
              if (err) {
                res
                  .status(400)
                  .send({ ok: false, message: "Couldn't update session" });
              } else {
                //Respond to http request and send firebase notification
                res.status(200).send({ ok: true });
                session[0].status = "running";
                firebaseUtil.sendFirebase(session[0]);
              }
            }
          );
        } else {
          res
            .status(400)
            .send({ ok: false, message: "Session has already started" });
        }
      }
    });
});

module.exports = router;
