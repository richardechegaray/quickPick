const axios = require("axios");

// // require syntax
// const fetch = require('node-fetch');
// global.fetch = fetch;

// const Unsplash = require('unsplash-js').default;
// const toJson = require('unsplash-js').toJson;

// const unsplash = new Unsplash({ accessKey: process.env.APP_ACCESS_KEY });

const mongoUtil = require("../database/mongo");
const db = mongoUtil.getDb();

module.exports = {
    getImage: async function(searchString) {
        let searchResult = await db.collection(process.env.IMAGES_COLLECTION)
        .findOne({name: searchString.toLowerCase()});
        
        if (searchResult !== null) {
            console.log("Found cached image.")
            return searchResult.urls;
        }
        else {
            console.log("No cached image, making external API call.")
            const unsplashResult = await axios.get(
                "https://api.unsplash.com/search/photos",
                { params: {query: searchString, per_page: 1, orientation: "portrait", 
                  client_id: String(process.env.UNSPLASH_ACCESS_KEY) }});
            console.log(unsplashResult);
                  await db.collection(process.env.IMAGES_COLLECTION).insertOne({
                name: searchString.toLowerCase(),
                urls: unsplashResult.data.results[0].urls.small
            });
            return String(unsplashResult.data.results[0].urls.small);
        }
    }
}

// const unsplash = new Unsplash({
//   accessKey: APP_ACCESS_KEY,
//   // Optionally you can also configure a custom header to be sent with every request
//   headers: {
//     "X-Custom-Header": "foo"
//   },
//   // Optionally if using a node-fetch polyfill or a version of fetch which supports the timeout option, you can configure the request timeout for all requests
//   timeout: 500 // values set in ms
// });