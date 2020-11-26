const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    name: String, // String is shorthand for {type: String}
    id: String,
    firebaseToken: String,
    preferences: [{
        type: String,
    }],
    pendingPreferences: [{
        type: String,
    }],
});

const User = mongoose.model("users", userSchema);
module.exports = User;