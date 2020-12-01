const app = require("./app.js");
const Console = require("Console");

// Import the database connection
require("./database/mongodb");

// Listen on PORT
var server = app.listen(process.env.PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    Console.success("Listening at http://%s:%s", host, port);
});