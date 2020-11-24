const ObjectId = require("mongodb").ObjectID;
const firebaseUtil = require("../plugins/firebase");
const Session = require("../models/session");
const User = require("../models/user");
const List = require("../models/list");

/*
----------Helper functions
*/
/*
Random string helper
Params: length, chars: string of valid characters to be selected
Returns: string
*/
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


module.exports = {
  getSession: async (req, res) => {
    console.log("DEBUG: Get request to /session/" + req.params.pin);
    let session = await Session.findOne({ pin: req.params.pin });
    let inSession = false;
    session.participants.forEach((user) => {
      if (user.id === res.locals.id) {
        inSession = true;
      }
    });
    if (!inSession) {
      res.status(400).send({ ok: false, message: "User is not in session" });
      return;
    }
    if (typeof session === "undefined" || session === null) {
      res.status(400).send({ ok: false, message: "Invalid session" });
      return;
    }
    res.status(200).send(session);
  },

  createSession: async (req, res) => {
    console.log("DEBUG: Post request to /session");

    let rString = randomString(
      5,
      "023456789abcdefghjkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ"
    );
    let uniquePin = false;
    while (!uniquePin) {
      let foundSessions = await Session.find({ pin: rString });
      if (foundSessions.length == 0) {
        uniquePin = true;
      } else {
        rString = randomString(
          5,
          "023456789abcdefghjkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ"
        );
      }
    }

    let user = await User.findOne({ id: String(res.locals.id) });

    //Assert user has logged in and parameters are valid
    if (
      user === null ||
      typeof res.locals.id !== "string"
    ) {
      res.status(400).send({ ok: false, message: "Invalid parameters" });
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
      results: [],
      participants: [{ name: user.name, id: String(res.locals.id) }],
    };

    //Add to session collection
    await Session.create(session);
    res.status(201).send(session);
  },

  receiveChoices: async (req, res) => {
    console.log(
      "DEBUG: post request to /session/" + req.params.id + "/choices"
    );
    //Find session
    let query = { pin: req.params.id };
    let currentSession = await Session.findOne(query);

    //Assert session exists
    if (currentSession === null || typeof req.body.choices !== "object") {
      res
        .status(401)
        .send({
          ok: false,
          message: "Session doesn't exist or choices are invalid",
        });
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
    await Session.updateOne(query, newValues);

    res.status(200).send({ ok: true });
    return;
  },

  addUser: async (req, res) => {
    console.log("DEBUG: Post request to /session/" + req.params.id);

    /* Get session matching ID */
    let session = await Session.findOne({ pin: req.params.id });

    //Assert session is found
    if (session == null) {
      console.log("No session exists with ID: " + req.params.id);
      res.status(404).send({ ok: false });
      return;
    }

    //Assert session has not started
    if (session.status !== "lobby") {
      console.log(
        "Session " + req.params.id + " is no longer accepting new participants"
      );
      res.status(400).send({ ok: false });
      return;
    }

    /* Get user matching the token that was authenticated */
    let user = await User.findOne({ id: String(res.locals.id) });

    if (!user) {
      await res
        .status(400)
        .send({ ok: false, message: "User is already in session" });
      return;
    }

    let isInSession = false;
    /* Assert user isn't in session */
    for (const index in session.participants) {
      if (user.id === session.participants[parseInt(index)].id) {
        isInSession = true;
        break;
      }
    }

    if (!isInSession) {
      /* Create new person and insert */
      let newPerson = { name: user.name, id: String(res.locals.id) };
      let participants = session.participants;
      participants.push(newPerson);
      session.participants = participants;

      /* Update db */
      await Session.updateOne(
        { pin: req.params.id },
        { $set: { participants } }
      );
    }

    /* Push firebase message to each user in the session */
    let firebaseMessage = {
      session,
    };
    firebaseUtil.sendFirebase(firebaseMessage);
    res.status(200).send({ ok: true });
    return;
  },

  startSession: async (req, res) => {
    console.log("DEBUG: Post request to /session/" + req.params.id + "/run");
    //Find session
    let session = await Session.findOne({ pin: req.params.id });

    //Assert session exists
    if (session === null) {
      res.status(404).send({ ok: false, message: "Session does not exist" });
      return;
    }
    //Assert user has rights to start
    if (
      session.creator !== String(res.locals.id) ||
      session.status !== "lobby"
    ) {
      res
        .status(400)
        .send({
          ok: false,
          message: "User is not the creator or session has started",
        });
      return;
    }

    //Assert session references a valid list
    if (session.listID === "" || typeof session.listID !== "string") {
      res
        .status(400)
        .send({ ok: false, message: "Session contains an invalid list ID" });
      return;
    }

    let newResults = [];
    let foundList = await List.findOne({ _id: ObjectId(session.listID) });

    foundList.ideas.forEach((foundIdea) => {
      newResults.push({ idea: foundIdea, score: 0 });
    });

    session.status = "running";
    session.results = newResults;
    var newvalues = { $set: { status: "running", results: newResults } };
    //Update session database

    await session.save(); //Session.updateOne({ pin: req.params.id }, newvalues);

    //Respond to http request and send firebase notification
    res.status(200).send({ ok: true });
    var firebaseMessage = {
      session,
    };
    firebaseUtil.sendFirebase(firebaseMessage);
    return;
  },

  updateList: async (req, res) => {
    console.log("DEBUG: Put request to /session/" + req.params.id);
    //Assert session exists
    let checkSession = await Session.findOne({ pin: req.params.id });
    if (checkSession === null) {
      res.status(404).send({ ok: false, message: "Session does not exist" });
      return;
    }
    //Find list that matches
    let foundList = await List.findOne({ _id: ObjectId(req.body.listID) });

    //Assert parameters are valid
    if (
      req.params.id === null ||
      req.body.listID === null ||
      foundList === null
    ) {
      res.status(400).send();
      return;
    }

    //Update database
    let newvalues = {
      $set: { listID: req.body.listID, listName: foundList.name },
    };
    await Session.updateOne({ pin: req.params.id }, newvalues);

    //Send firebase message
    let updatedSession = await Session.findOne({ pin: req.params.id });

    let fbMessage = {
      session: updatedSession,
    };
    firebaseUtil.sendFirebase(fbMessage);
    res.status(200).send(updatedSession);
  },

  getList: async (req, res) => {
    console.log("DEBUG: Get request to session/" + req.params.id + "/list");
    //Assert session id is valid
    if (typeof req.params.id !== "string") {
      res.status(400).send({ ok: false, message: "Invalid session ID" });
      return;
    }

    let session = await Session.findOne({ pin: req.params.id });

    //Assert user is in session
    session.participants.forEach((user) => {
      if (user.id === res.locals.id) {
        inSession = true;
      }
    });
    if (!inSession) {
      res.status(400).send({ ok: false, message: "User is not in session" });
      return;
    }

    //Assert session exists
    if (session === null) {
      res
        .status(400)
        .send({ ok: false, message: "Session could not be found" });
      return;
    }
    let foundList = await List.findById(session.listID);

    res.status(200).send(foundList);
  },
};
