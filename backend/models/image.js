const mongoose = require("mongoose");
const { Schema } = mongoose;

const imageSchema = new Schema({
    name: String, // String is shorthand for {type: String}
    urls: String
});

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;