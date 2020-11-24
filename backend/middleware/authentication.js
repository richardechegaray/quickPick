const axios = require("axios");
require("dotenv").config();

module.exports = {
    checkFB: async (req, res, next) => {
        const facebookToken = req.headers.facebooktoken;
        const url = `https://graph.facebook.com/debug_token?input_token=${facebookToken}&access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`;

        const facebookResponse = await axios.get(url);
        
        if (facebookResponse.data.data.is_valid) {
            res.locals.id = facebookResponse.data.data.user_id;
            next();
        }
        else {
            res.status(401).send({ message: "Failed to authenticate Facebook token" });
        }
    }
};
