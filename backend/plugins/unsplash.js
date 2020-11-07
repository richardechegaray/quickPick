const axios = require("axios");

const mongoUtil = require("../database/mongo");
const db = mongoUtil.getDb();

module.exports = {
    getImage: async (searchString) => {
        let searchResult = await db.collection(process.env.IMAGES_COLLECTION)
        .findOne({name: searchString.toLowerCase()});
        
        if (searchResult !== null) {
            console.log("Found cached image.");
            return searchResult.urls;
        }
        else {
            console.log("No cached image, making external API call.");
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
};
