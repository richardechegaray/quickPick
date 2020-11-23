const axios = require("axios");

const User = require("../models/user");

function findUser(userID) {
  return User.findOne({ id: String(userID) });
}

function updateFirebaseToken(userID, firebaseToken) {

  const filter = { "id": String(userID) };
  const update = { $set: { "firebaseToken": String(firebaseToken) }};
  User.findOneAndUpdate(filter, update)
  .catch((err) => {
    console.log(err);
  });
  console.log(`Verified user, FB token updated for ${userID}`);
}

function createNewUser(userID, name, firebaseToken) {
  console.log(`FirebaseToken: ${firebaseToken}`);
  User.create({
    id: String(userID),
    name: String(name),
    firebaseToken: String(firebaseToken),
  });
}

function loginHelper(userID, firebaseToken, res, callback) {
  console.log("DEBUG: Post request to login");
  /* Check users collection for document with matching FB id */
  findUser(userID)
    .then((foundUser) => {
      /* If a user in the DB has a matching id */
      if (foundUser !== null) {
        if (firebaseToken !== foundUser.firebaseToken) {
          updateFirebaseToken(userID, firebaseToken);
          callback(res, 200, {
            message: "Logged in user, updated Firebase token",
            ok: true,
          });
        } else {
          callback(res, 200, {
            message: "Logged in user, did not change Firebase token",
            ok: true,
          });
        }
      } else {
        /* Get user's name */
        let url = `https://graph.facebook.com/v8.0/${userID}?access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`;
        axios
          .get(url)
          .then((facebookResponse) => {
            /* Create new user */
            createNewUser(userID, facebookResponse.data.name, firebaseToken);
            callback(res, 200, { message: "Created new user", ok: true });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
      callback(res, 500, { message: "Error during authentication", ok: false });
    });
}
module.exports = { loginHelper, createNewUser, updateFirebaseToken, findUser };
