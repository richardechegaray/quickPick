require("dotenv").config();

// Initialize Express
const app = require("express")();
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

// Import the database connection
require('./database/mongodb');

// Import routes
const loginRouter = require("./routes/login");
const listRouter = require("./routes/list");
const sessionRouter = require("./routes/session");
app.use("/login", loginRouter);
app.use("/list", listRouter);
app.use("/session", sessionRouter);

// Listen on PORT
var server = app.listen(process.env.PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Listening at http://%s:%s", host, port);
});
