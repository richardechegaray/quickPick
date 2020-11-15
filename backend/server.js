const app = require("./app.js");

// Import the database connection
require('./database/mongodb');

// Listen on PORT
var server = app.listen(process.env.PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Listening at http://%s:%s", host, port);
});