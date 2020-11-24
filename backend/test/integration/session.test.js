const request = require("supertest");
const { isExportDeclaration } = require("typescript");
const app = require("../../app");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const dbHelper = require("../db/mongodb");

const User = require("../../models/user");
const Session = require("../../models/session");
const List = require("../../models/list");

describe("Session Integration", function () {
    const facebookToken = "EAALsZAFPkrZAUBAPyyFTYb5h6qehgpG6aDtYgXA3sEopdZAI5zP1ZCfdCvs8fNNeCCgns4kaIZBmuZA2OboGYvCedAWSkIWJJxbDijzY6zNgby1bqhyUvp6JAMIWJfyrZBe4ZAIZAMUTgC0fzyx5iRAaGiNexb2e7DCasYZBkjxVLtaiRwZBecHn7mHeZCfu3CXcP9AOw86hdZBoQmM7tycqYA5jLLJndw10OR3ZBWW1TWCh6ZAPV5lPVbtuvB4HXKytpr6eM8ZD";

    let sessionPin = "";
    beforeAll(async () => {
        await dbHelper.connect();

        /* Clear out the database */
        await Session.deleteMany({});
        await User.deleteMany({});
        await List.deleteMany({});

        let newUser = {
            name: "Ava Alefgghaihiec Narayananberg",
            id: "108059947763278"
        }
        await User.create(newUser);

        

        let list = {
            userID: "108059947763278",
            name: "Food Cuisines",
            ideas: [
                {
                    name: "Italian"
                },
                {
                    name: "French"
                },
                {
                    name: "Mexican"
                }
            ]
        };
    
        await List.create(list);
        let myList = await List.findOne({});
        let newSession = {
            pin: "abcd",
            listID: myList._id,
            status: "lobby",
            creator: "108059947763278",
            complete: 0,
            size: 6,
            results: [],
            participants: [{
                name: "Ava Alefgghaihiec Narayananberg",
                id: "108059947763278",
            }]
        }
        await Session.create(newSession);
    })

    afterAll(async () => {
        await dbHelper.close();
    })

    it("Create session", async () => {
        const response = await request(app).post("/session/").set({facebookToken}).send({size: 6});
        expect(response.status).toBe(201);
    });
    it("Start session", async () => {
        const response = await request(app).post("/session/abcd/run").set({facebookToken});
        expect(response.status).toBe(200);
    });
    it("Receive choices", async () => {
        const response = await request(app).post("/session/abcd/choices").set({facebookToken}).send({choices: [
            {
                idea: {name: "Italian"}, choice: true
            },
            {
                idea: {name: "French"}, choice: false
            },
            {
                idea: {name: "Mexican"}, choice: true
            }
        ]});
        expect(response.status).toBe(200);
    });
});