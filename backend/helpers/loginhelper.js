const axios = require("axios");
const mongoUtil = require("../database/mongo");
const db = mongoUtil.getDb();

function loginHelper(userID, firebaseToken, res, callback){
    console.log("DEBUG: Post request to login");
    /* Check users collection for document with matching FB id */
    findUser(userID)
        .then((foundUser) => {
            /* If a user in the DB has a matching id */
            if (foundUser !== null) {
                if (firebaseToken !== foundUser.firebaseToken) {
                    updateFirebaseToken(userID, firebaseToken);
                    callback(res, 200, {"message": "Logged in user, updated firebase token", "ok": true});
                }
                else{
                    callback(res, 200, {"message": "Logged in user, did not change firebase token", "ok": true});
                }
            }
            else {
                /* Get user's name */
                let url = `https://graph.facebook.com/v8.0/${userID}?access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`;
                axios.get(url)
                    .then((facebookResponse) => {
                        /* Create new user */
                        createNewUser(userID, facebookResponse.data.name, firebaseToken);
                        callback(res, 200, {"message": "Created new user", "ok": true});
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        })
        .catch((err) => {
            console.log(err);
            callback(res, 500, {"message": "Error during authentication", "ok": false})
        });    
}
module.exports = {loginHelper};

function findUser(userID){
    return db.collection(process.env.USER_COLLECTION).findOne({ id: String(userID) })
}

function updateFirebaseToken(userID, firebaseToken){
    db.collection(process.env.USER_COLLECTION)
    .updateOne(
        { id: String(userID) },
        { $set: { "firebaseToken": String(firebaseToken) } })
    console.log("Verified user, FB token didn't need to be updated");
}

function createNewUser(userID, name, firebaseToken){
    db.collection("users").insertOne(
        {
            "id": String(userID),
            "name": String(name),
            "firebaseToken": String(firebaseToken)
        });
}