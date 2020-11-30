const Console = require("Console");

/* Wraps endpoint functions in a try-catch to handle internal errors */
exports.catchErrors = (action) => (req, res) => action(req, res).catch((err) => {
    Console.error(err);
    res.status(500).send({});
});
