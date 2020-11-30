const axios = require("axios");
const Image = require("../models/image");

module.exports = {
    getImage: async (searchString) => {
        let searchResult = await Image.findOne({name: searchString.toLowerCase()}).catch(() => null);
        
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
            
            const newImage = (unsplashResult.data.results[0]) ? 
                unsplashResult.data.results[0].urls.small : 
                "https://envision.design/wp-content/uploads/2019/12/image-coming-soon.jpg";

            await Image.create(
                {
                    name: searchString.toLowerCase(),
                    urls: newImage
                });

            return String(newImage);
        }
    }
};
