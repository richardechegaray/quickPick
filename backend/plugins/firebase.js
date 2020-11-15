const User = require("../models/user");
// Initialize Firebase
const admin = require("firebase-admin");
const serviceAccount = require("../quickpick-7f20f-firebase-adminsdk-hvb4p-96107c2f64.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});

// Helper function for sending firebase messages
module.exports = {
    sendFirebase: async (body) => {
        try {
            const idList = body.session.participants.map((u) => u.id);
            let users = await User.find({ "id": { $in: idList } }).select({"firebaseToken": 1});
            let tokens = users.map((t) => t.get("firebaseToken"));

            let msg = {
                data: {
                    session: JSON.stringify(body.session),
                },
                tokens,
                "android": {
                    "priority": "normal"
                },
            };

            if (body.list !== undefined) {
                msg.data.list = JSON.stringify(body.list);
            };

            let response = await admin.messaging().sendMulticast(msg)
            console.log(response.successCount + " messages were sent successfully");

        } catch (error) {
            console.log(error);
        }
    }
};