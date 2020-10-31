var axios = require('axios');
require('dotenv').config();

module.exports = {
    /* Verifies the token passed in the request's facebookToken field */
    checkFB: function(req, res, next) {
        let fb_token = req.body.facebookToken;
        let url = `https://graph.facebook.com/debug_token?input_token=${fb_token}&access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`
        
        /* Pass the token to the Facebook endpoint */
        axios.get(url)
        .then(fb_response => {
            if (fb_response.data.data.is_valid) {
                res.locals.id = fb_response.data.data.user_id
                /* Run the protected function on the endpoint */
                next();
            }
            else {
                /* Bad token, reject access to the endpoint */ 
                res.status(401);
                res.json({ "message": "Invalid token!",
                                "ok": false });
            }
            
        })
        .catch(error => {
            /* Validation Error occured (likely a bad parameter) */
            res.status(401);
            console.log(error);
            res.json({"message": "FB request returned an error",
                           "ok": false });
        });
    }
}

