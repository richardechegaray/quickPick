const List = require("../models/list");
const imgUtil = require("../plugins/unsplash");

module.exports = {
    /* Returns all lists where the userID field matches the user making the request */
    getMyLists: async (req, res) => {
        console.log("DEBUG: Get request to lists");
        const myLists = await List.find({ userID: { $in: [res.locals.id, "quickpick.admin"] } })
            .sort({ name: 1 });

        let listResponseObj = { lists: [] };

        myLists.forEach((ideaList) => {
            let listSimplified = { name: ideaList.name, _id: ideaList._id };
            listResponseObj.lists.push(listSimplified);
        });

        res.status(200).send(listResponseObj);

    },
    /* Takes the list from the request body and puts it into the DB */
    createList: async (req, res) => {
        console.log("DEBUG: Post request to lists");
        let newList = req.body.list;

        /* newList cannot be null*/
        if (!newList) {
            console.log("DEBUG: List in body is null");
            res.status(400).send({});
        }
        else {
            /* Add an image url to each idea on the list */
            for (let i = 0; i < newList.ideas.length; i++) {
                let imgUrl = await imgUtil.getImage(newList.ideas[parseInt(i, 10)].name);
                newList.ideas[parseInt(i, 10)].picture = imgUrl;
            }
            /* Set user making request as the list's owner */
            newList.userID = res.locals.id;

            await List.create(newList);
            res.status(201).send(newList);
        }
    },

    /* Finds a list matching the id and returns it if the the list belongs to the user */
    getList: async (req, res) => {
        console.log("DEBUG: Get request to list");
        /* Find the list matching the id */
        const myList = await List.findById(req.params.id).catch(() => null);

        if (myList == null) {
            console.log(`DEBUG: Did not find a list matching _id: ${req.params.id}`);
            res.status(404).send({});
        }
        else if (myList.userID !== res.locals.id && myList.userID !== "quickpick.admin") {
            console.log("DEBUG: Attempted to access another user's list");
            res.status(403).send({});
        }
        else {
            res.status(200).send(myList);
        }
    }
};
