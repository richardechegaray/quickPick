const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const mongod = new MongoMemoryServer();

module.exports = {
    connect: async () => {
        const mongooseOpts = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };
        await mongoose.connect(process.env.MONGO_URL, mongooseOpts);
    },
    close: async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongod.stop();
    }
};
