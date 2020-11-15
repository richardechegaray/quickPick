const mongoose = require("mongoose");
const { Schema } = mongoose;

const sessionSchema = new Schema({
    pin: String, 
    listID: String,
    listName: String,
    status: {
        type: String,
        enum: ["lobby", "running", "complete"],
        default: "lobby"
    },
    creator: String,
    complete: Number,
    size: Number,
    results: [{
        idea: {
            name: String,
            description: String,
            picture: String,
        },
        score: Number
    }],
    participants: [{
        name: String,
        id: String
    }]
});

const Session = mongoose.model('sessions', sessionSchema);
module.exports = Session;