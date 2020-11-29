const mongoose = require("mongoose");
const { Schema } = mongoose;

const listSchema = new Schema({
    name: String, // String is shorthand for {type: String}
    description: String,
    ideas: [{ 
        name: String, 
        description: String,
        picture: String, 
    }],
    // date: { type: Date, default: Date.now },
    userID: String,
});

const List = mongoose.model("lists", listSchema);
module.exports = List;