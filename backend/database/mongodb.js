const mongoose = require("mongoose");
const Console = require("Console");

const ENDPOINT = process.env.MONGO_URL;

mongoose.connect(ENDPOINT, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
    Console.success(`Connected to database at ${ENDPOINT}`);
});