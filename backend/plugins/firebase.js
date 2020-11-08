const mongoUtil = require("../database/mongo");
const db = mongoUtil.getDb();

// Initialize Firebase
const admin = require("firebase-admin");
const serviceAccount = require("../quickpick-7f20f-firebase-adminsdk-hvb4p-96107c2f64.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});

// Helper function for sending firebase messages
module.exports = {
    sendFirebase: (data) => {
        let session = data.session;
        console.log(data);
        console.log(JSON.stringify(data));
        const idList = session.participants.map((u) => u.id);
        db.collection(process.env.USER_COLLECTION)
            .find({ "id": { $in: idList } })
            .project({ "firebaseToken": true })
            .toArray()
            .then((tokens) => {
                let msgData = JSON.stringify(data);
                let msg = {
                    "data": msgData,
                    "tokens": tokens.map((t) => t.firebaseToken),
                    "android":{
                        "priority":"normal"
                    },
                };
                console.log(msg.tokens);
                admin.messaging().sendMulticast(msg)
                    .then((response) => {
                        console.log(response);
                        // console.log(response.successCount + " messages were sent successfully");
                    });
            });
    }
};