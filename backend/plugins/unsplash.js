const axios = require("axios");
const Image = require("../models/image");

module.exports = {
    getImage: async (searchString) => {
        // let searchResult = await db.collection(process.env.IMAGES_COLLECTION)
        // .findOne({name: searchString.toLowerCase()});
        let searchResult = await Image.findOne({name: searchString.toLowerCase()});
        
        if (searchResult !== null) {
            console.log("Found cached image.");
            return searchResult.urls;
        }
        else {
            console.log("No cached image, making external API call.");
            let unsplashParameters = { 
                "query": searchString, 
                "per_page": 1, 
                "orientation": "portrait", 
                "client_id": String(process.env.UNSPLASH_ACCESS_KEY) };
            const unsplashResult = await axios.get(
                "https://api.unsplash.com/search/photos",
                { params: unsplashParameters });
            console.log(unsplashResult);
            //       await db.collection(process.env.IMAGES_COLLECTION).insertOne({
            //     name: searchString.toLowerCase(),
            //     urls: unsplashResult.data.results[0].urls.small
            // });
            await Image.create(
                {
                    name: searchString.toLowerCase(),
                    urls: unsplashResult.data.results[0].urls.small
                });

            return String(unsplashResult.data.results[0].urls.small);
        }
    }
};
