const MongoClient = require("mongodb").MongoClient;

var _db;

module.exports = {
    connectToServer: (callback) => {
        MongoClient.connect(process.env.MONGOURL, { useNewUrlParser: true }, function (err, client) {
            _db = client.db("quickpick");
            return callback(err);
        });
    },
    getDb: () => {
        return _db;
    }
};