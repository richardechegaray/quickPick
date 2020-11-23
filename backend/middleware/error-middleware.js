/* Wraps endpoint functions in a try-catch to handle internal errors */
exports.catchErrors = action => (req, res) => action(req, res).catch((err) => {
    console.log(err);
    res.status(500).send({});
})
