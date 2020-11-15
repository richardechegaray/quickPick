const mongoose = require("mongoose");

const ENDPOINT = process.env.MONGO_URL;

mongoose.connect(ENDPOINT, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
    console.log(`Connected to database at ${ENDPOINT}`);
});