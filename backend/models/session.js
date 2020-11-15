const mongoose = require("mongoose");
const { Schema } = mongoose;

const sessionSchema = new Schema({
    pin: String, 
    listID: String,
    status: {
        type: String,
        enum: ["lobby", "running", "complete"],
        default: "lobby"
    },
    creator: String,
    complete: Number,
    size: Number,
    results: [{
        name: String, 
        description: String,
        picture: String, 
    }],
    participants: [{
        name: String,
        id: String
    }]
});

const Session = mongoose.model('sessions', sessionSchema);
module.exports = Session;