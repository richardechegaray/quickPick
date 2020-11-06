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
    sendFirebase: (session) => {
        const idList = session.participants.map((u) => u.id);
        db.collection(process.env.USER_COLLECTION)
            .find({ "id": { $in: idList } })
            .project({ "firebaseToken": true })
            .toArray()
            .then((tokens) => {
                let msgData = { "type": "session", "session": JSON.stringify(session) };
                let msg = {
                    "data": msgData,
                    "tokens": tokens.map((t) => t.firebaseToken),
                    "webpush": {
                        "headers": {
                          "Urgency": "high"
                        }
                    }
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