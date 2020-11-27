const request = require("supertest");
const app = require("../../app");

require("dotenv").config();

const dbHelper = require("../db/mongodb");

const User = require("../../models/user");
const Session = require("../../models/session");
const List = require("../../models/list");

describe("Session Integration", function () {
    const facebookToken = "EAALsZAFPkrZAUBAO5AdNmEesraFKVzn5shZBtUJIFZAMjA2r6dDgZAHRZA22g9JcWVXjd1gyjw8PvSQaFtexH04Kzl2dyfUdR3cu7FbYMgiGJGP5bWoaRQITqZByqFslzW4M2ZBBBIkyiQJksMkLA7kU8D8HX1lwEPMbEM4G9lxO0D8e80iXUZB8x";

    let sessionPin = "";
    beforeAll(async () => {
        await dbHelper.connect();

        /* Clear out the database */
        await Session.deleteMany({});
        await User.deleteMany({});
        await List.deleteMany({});

        let newUser = {
            name: "Buyonacy Changstein",
            id: "100722321844479",
            preferences: Array(20).fill("Pizza"), // Max out preference list for coverage
        }
        await User.create(newUser);

        let list = {
            userID: newUser.id,
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
            creator: newUser.id,
            complete: 0,
            results: [],
            participants: [{
                name: "Buyonacy Changstein",
                id: newUser.id,
            }]
        }
        await Session.create(newSession);
    });

    afterAll(async () => {
        await dbHelper.close();
    });

    it("Create session", async () => {
        const response = await request(app).post("/session/").set({facebookToken}).send({});
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