var axios = require('axios');

module.exports = {
    checkFB: function(req, res, next) {
        let fb_token = req.body.facebookToken;
        console.log("AUTH-MIDDLEWARE: Token is: " + fb_token);
        let url = `https://graph.facebook.com/debug_token?input_token=${fb_token}&access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`
        axios.get(url)
        .then(fb_response => {
            if (fb_response.data.data.is_valid) {
                console.log("AUTH-MIDDLEWARE: Token is valid!");
                res.locals.id = fb_response.data.data.user_id
                console.log(res.locals);
                // console.log(res.locals.id);
                next();
            }
            else {
                console.log("AUTH-MIDDLEWARE: Invalid token!");
                res.status(401);
                res.json({ "message": "Invalid token!",
                                "ok": false });
            }
            
        })
        .catch(error => {
            console.log("AUTH-MIDDLEWARE: Auth Error!");
            res.status(401);
            res.json({"message": "FB request returned an error",
                           "ok": false });
        });
    }
}

