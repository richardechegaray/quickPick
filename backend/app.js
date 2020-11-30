require("dotenv").config();

// Initialize Express
const app = require("express")();
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

// Add logging for HTTP Requests
const  morgan = require("morgan");
app.use(morgan("dev"));

// Import routes
const loginRouter = require("./routes/login");
const listRouter = require("./routes/list");
const sessionRouter = require("./routes/session");
app.use("/login", loginRouter);
app.use("/list", listRouter);
app.use("/session", sessionRouter);

module.exports = app;