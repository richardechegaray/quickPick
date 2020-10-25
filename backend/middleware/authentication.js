var axios = require('axios');
// require('dotenv').config();
require('dotenv').config();
// console.log(printme);
// console.log(process.env);
// let FB_APP_ID = "822865601801621"
// let FB_APP_SECRET = "cc8d4caddc2daa3c0d986f87386b1f16"
// let FACEBOOK_CALLBACK_URL = "https://ec2-13-52-219-93.us-west-1.compute.amazonaws.com:8081/auth/facebook/callback"

module.exports = {
    /* Verifies the token passed in the request's facebookToken field */
    checkFB: function(req, res, next) {
        let fb_token = req.body.facebookToken;
        let url = `https://graph.facebook.com/debug_token?input_token=${fb_token}&access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`
        // let url = `https://graph.facebook.com/debug_token?input_token=${fb_token}&access_token=${FB_APP_ID}|${FB_APP_SECRET}`
        
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

