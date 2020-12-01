const List = require("../models/list");
const imgUtil = require("../plugins/unsplash");
const Console = require("Console");

/* Checks ownership of list */
function isOwnedByUser(list, access, res) {
    return list.userID === res.locals.id || (access === "read" && list.userID === "quickpick.admin");
}

/* Helper function to check if a user has access to a list, and verifies that the list has been passed */
function checkListAccess(list, access, res) {
    /* Check that the list exists */
    if (!list) {
        Console.warn(`Did not find a list matching _id: ${res.locals.id}`);
        res.status(404).send({});
        return false;
    }
    /* User must own the list, unless they are trying to read a default list */
    else if (!isOwnedByUser(list, access, res)) {
        Console.warn("Attempted to access another user's list");
        res.status(403).send({});
        return false;
    }
    return true;
}

/* Checks that the ideas passed to updateList are not null */
function checkIdeasExist(updates, res) {
    if (!updates || !updates.ideas) {
        Console.warn("List in body is null");
        res.status(400).send({});
        return false;
    }
    else {
        return true;
    }
}

module.exports = {
    /* Returns all lists where the userID field matches the user making the request */
    getMyLists: async (req, res) => {
        const myLists = await List.find({ userID: { $in: [res.locals.id, "quickpick.admin"] } })
            .sort({ name: 1 });

        let listResponseObj = { lists: [] };

        myLists.forEach((ideaList) => {
            // let listSimplified = { name: ideaList.name, _id: ideaList._id };
            listResponseObj.lists.push(ideaList);
        });

        res.status(200).send(listResponseObj);

    },
    /* Takes the list from the request body and puts it into the DB */
    createList: async (req, res) => {
        let newList = req.body.list;

        /* newList cannot be null*/
        if (!newList) {
            Console.warn("List in body is null");
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

    /* Takes the list from the request body updates the list matching the id */
    updateList: async (req, res) => {
        const myList = await List.findById(req.params.id).catch(() => null);
        const updates = req.body.list;

        /* Must have access to a valid list, with non-null updates*/
        if (checkListAccess(myList, "write", res) && checkIdeasExist(updates, res)) {
            /* Add an image url to each idea on the list */
            for (let i = 0; i < updates.ideas.length; i++) {
                const imgUrl = await imgUtil.getImage(updates.ideas[parseInt(i, 10)].name);
                updates.ideas[parseInt(i, 10)].picture = imgUrl;
            }

            /* Update the name and description too if there are changes present */
            const myName = (updates.name) ? updates.name : myList.name;
            const myDesc = updates.description;

            const newValues = {
                $set: {
                    ideas: updates.ideas,
                    description: myDesc,
                    name: myName,
                }
            };
            await List.findByIdAndUpdate(req.params.id, newValues);

            /* Add updates to returned list */
            myList.ideas = updates.ideas;
            myList.description = myDesc;
            myList.name = myName;
            res.status(200).send(myList);
        }
    },

    /* Finds a list matching the id and returns it if the the list belongs to the user */
    getList: async (req, res) => {
        /* Find the list matching the id */
        const myList = await List.findById(req.params.id).catch(() => null);

        if (checkListAccess(myList, "read", res)) {
            res.status(200).send(myList);
        }
    },

    /* Deletes a list matching the id if the the list belongs to the user */
    deleteList: async (req, res) => {
        /* Find the list matching the id */
        const myList = await List.findById(req.params.id).catch(() => null);

        if (checkListAccess(myList, "write", res)) {
            await List.findByIdAndDelete(req.params.id);
            res.status(200).send({});
        }
    }
};
