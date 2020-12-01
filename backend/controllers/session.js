const ObjectId = require("mongodb").ObjectID;
const firebaseUtil = require("../plugins/firebase");
const Session = require("../models/session");
const User = require("../models/user");
const List = require("../models/list");
const Console = require("Console");

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
 * Takes a list of choices (just the lowercase names of each) and appends
 * them to the user's preference list. Keeps only the 20 most recent choices.
 */
async function queueUserPreferences(userID, choices) {
  const myUser = await User.findOne({ id: userID });
  let myPreferences = myUser.pendingPreferences;

  /* Add new choices to preference list */
  myPreferences.push(...choices);
  const newValues = {
    $set: {
      pendingPreferences: myPreferences
    }
  };
  await User.findOneAndUpdate({ id: userID }, newValues);
}

async function updateUserPreferences(userID) {
  const MAX_TRACKED = 20;
  const myUser = await User.findOne({ id: userID });
  let myPreferences = myUser.preferences;
  let newPreferences = myUser.pendingPreferences;

  /* Add new choices to preference list */
  myPreferences = myPreferences.concat(...newPreferences);
  /* Delete oldest elements to maintain size */
  while (myPreferences.length > MAX_TRACKED) {
    myPreferences.shift();
  }

  const newValues = {
    $set: {
      preferences: myPreferences,
      pendingPreferences: []
    }
  };
  await User.findOneAndUpdate(
    { id: userID },
    newValues,
  );
}

async function isUserInSession(userID, session) {
  for (const index in session.participants) {
    if (userID === session.participants[parseInt(index, 10)].id) {
      return true;
    }
  }
  return false;
}

async function updateScores(choices, results) {
  await choices.forEach(async (choice) => {
    await results.forEach(async (result) => {
      //If they match and the response is positive, then increment the record
      if (choice.idea.name === result.idea.name && choice.choice) {
        result.score += 1;
      }
    });
  });
  return results;
}

async function checkIfNull(firstCheck, secondCheck) {
  if (firstCheck === null || secondCheck === null) {
    return true;
  }
  else {
    return false;
  }
}

async function assertUserCanJoin(user, session, res) {
  //Assert session is found
  if (await checkIfNull(user, session)) {
    res.status(404).send({ ok: false });
    return false;
  }
  else if (session.status !== "lobby" || await isUserInSession(user.id, session)) {
    res.status(400).send({ ok: false, message: "Session has started/user is already in session" });
    return false;
  }
  return true;
}

async function assertSessionCanStart(userID, session) {
  if (
    session.creator !== String(userID) ||
    session.status !== "lobby" || session.listID === ""
  ) {
    return false;
  }
  else {
    return true;
  }
}

async function assertChoicesCanReceive(session, choices, userID, res) {
  //Assert session exists
  if (await checkIfNull(session, choices)) {
    res
      .status(400)
      .send({
        ok: false,
        message: "Session doesn't exist or choices are invalid",
      });
    return false;
  }
  else if (!(await isUserInSession(userID, session))) {
    res
      .status(403)
      .send({ ok: false, message: "User ID is not in the session" });
    return false;
  }
  return true;
}

/*
 * BEGIN COMPLEX LOGIC
 */

function applyPreferences(user, results, ties) {
  for (let i = 0; i < ties; i++) {
    if (user.preferences.includes(results[parseInt(i, 10)].idea.name.toLowerCase())) {
      results[parseInt(i, 10)].score += 1;
    }
  }
}

async function sortSession(session) {
  /* Get list of participants */
  const participantIds = session.participants.map((p) => p.id);

  /* Sort the array of results based on number of votes */
  const results = session.results;
  results.sort((a, b) => {
    return b.score - a.score;
  });

  /* Now use past preferences to break ties */

  /* Get the number of choices tied for first, and their score */
  const maxVotes = results[0].score;
  const numTied = results.filter((choice) => choice.score === maxVotes).length;

  /* For each participant, check their preferences to update the votes */
  for (const userId of participantIds) {
    const user = await User.findOne({ id: userId });
    applyPreferences(user, results, numTied);
    /* Now that we are done with the user, add CURRENT session's choice to preference list */
    await updateUserPreferences(userId);
  }

  /* Sort the tied first-place choices based on their new scores */
  results.sort((a, b) => {
    return b.score - a.score;
  });

  /* Now that the ties have been broken, restore the original scores */
  for (let i = 0; i < numTied; i++) {
    results[parseInt(i, 10)].score = maxVotes;
  }
  return session;
}

/*
 * END COMPLEX LOGIC
 */

module.exports = {
  getSession: async (req, res) => {
    let session = await Session.findOne({ pin: req.params.id });
    //Assert session is found
    if (session === null) {
      res.status(404).send({ ok: false, message: "Invalid session" });
      return;
    }
    else if (!(await isUserInSession(res.locals.id, session))) {
      res.status(401).send({ ok: false, message: "User is not in session" });
      return;
    }
    res.status(200).send(session);
  },

  createSession: async (req, res) => {
    let rString = randomString(
      5,
      "023456789abcdefghjkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ"
    );
    let uniquePin = false;
    while (!uniquePin) {
      let foundSessions = await Session.find({ pin: rString });
      if (foundSessions.length === 0) {
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
    if (!user) { // res.locals.id won't be undefined/null if this fn is called
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
    //Find session
    let query = { pin: req.params.id };
    let currentSession = await Session.findOne(query);

    //Assert session exists
    if (!(await assertChoicesCanReceive(currentSession, req.body.choices, res.locals.id, res))) {
      return;
    }
    //Update user's preference list with their choices
    const chosenIdeas = req.body.choices.filter((c) => c.choice); // List of accepted ideas
    await queueUserPreferences(res.locals.id, chosenIdeas.map((c) => c.idea.name.toLowerCase()));

    //Iterate through responses, and also session to find idea names that match
    currentSession.results = await updateScores(req.body.choices, currentSession.results);

    //Push firebase notification if everyone has submitted their results
    let newComplete = currentSession.complete + 1;
    let newValues = {
      $set: { results: currentSession.results, complete: newComplete },
    };

    if (newComplete === currentSession.participants.length) {
      currentSession.status = "complete";
      currentSession = await sortSession(currentSession);
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
    }
    //Update database with new values
    await Session.updateOne(query, newValues);
    res.status(200).send({ ok: true });
    return;
  },

  addUser: async (req, res) => {
    let session = await Session.findOne({ pin: req.params.id });
    let user = await User.findOne({ id: String(res.locals.id) });

    //Assert session is found
    if (!(await assertUserCanJoin(user, session, res))) {
      return;
    }
    /* Create new person and insert */
    let newPerson = { name: user.name, id: String(res.locals.id) };
    let participants = session.participants;
    participants.push(newPerson);
    session.participants = participants;

    const sessionUpdates = {
      $set: {
        participants
      }
    };

    /* Update db */
    await Session.updateOne(
      { pin: req.params.id },
      sessionUpdates
    );

    /* Push firebase message to each user in the session */
    let firebaseMessage = {
      session,
    };
    firebaseUtil.sendFirebase(firebaseMessage);
    res.status(200).send({ ok: true });
    return;
  },

  startSession: async (req, res) => {
    //Find session
    let session = await Session.findOne({ pin: req.params.id });

    //Assert session exists
    if (session === null) {
      res.status(404).send({ ok: false, message: "Session does not exist" });
      return;
    }
    //Assert user has rights to start
    else if (!(await assertSessionCanStart(res.locals.id, session))) {
      res.status(400).send({
        ok: false,
        message: "User is not the creator / session has started / invalid list",
      });
      return;
    }
    let newResults = [];
    let foundList = await List.findById(session.listID);

    foundList.ideas.forEach((foundIdea) => {
      newResults.push({ idea: foundIdea, score: 0 });
    });

    session.status = "running";
    session.results = newResults;
    await session.save(); //

    //Respond to http request and send firebase notification
    res.status(200).send({ ok: true });
    var firebaseMessage = {
      session,
    };
    firebaseUtil.sendFirebase(firebaseMessage);
    return;
  },

  updateList: async (req, res) => {
    //Assert session exists
    let checkSession = await Session.findOne({ pin: req.params.id });
    if (checkSession === null) {
      res.status(404).send({ ok: false, message: "Session does not exist" });
      return;
    }

    //Assert parameters are valid
    let foundList = null;
    try {
      foundList = await List.findById(req.body.listID);
    } catch (error) {
      res.status(400).send({ ok: false, message: "List ID is not a valid ID" });
      return;
    }
    //Assert list is found
    if (foundList == null) {
      res.status(404).send({ ok: false, message: "List was not found" });
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
    let session = await Session.findOne({ pin: req.params.id });

    //Assert session id is valid
    if (session === null) {
      res.status(400).send({ ok: false, message: "Invalid session ID" });
      return;
    }

    let inSession = await isUserInSession(res.locals.id, session);
    if (!inSession) {
      res.status(401).send({ ok: false, message: "User is not in session" });
      return;
    }

    let foundList = await List.findById(session.listID);

    res.status(200).send(foundList);
  },
};
