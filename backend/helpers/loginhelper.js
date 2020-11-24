const axios = require("axios");

const User = require("../models/user");

module.exports = {
    putUser: async (req, res) => {
        const foundUser = await User.findOne({ id: String(res.locals.id) });
        /* Create user if DB doesn't have any users matching the id */
        if (!foundUser) {
            const url = `https://graph.facebook.com/v8.0/${res.locals.id}?access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`;

            const facebookResponse = await axios.get(url);
            await User.create({
                id: String(res.locals.id),
                name: String(facebookResponse.data.name),
                firebaseToken: String(req.body.firebaseToken),
            });
            res.status(201).send();
        }
        /* Otherwise, update the firebase token */
        else {
            const filter = { "id": String(res.locals.id) };
            const update = { $set: { "firebaseToken": String(req.body.firebaseToken) } };
            await User.findOneAndUpdate(filter, update);
            res.status(200).send();
        }
    }
};
