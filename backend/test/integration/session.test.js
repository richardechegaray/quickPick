const request = require('supertest');
const { isExportDeclaration } = require('typescript');
const app = require("../../app");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const dbHelper = require("../db/mongodb");

const User = require("../../models/user");
const Session = require("../../models/session");
const List = require("../../models/list");

describe("Session Integration", function () {
    const facebookToken = "EAALsZAFPkrZAUBAL6aMB2kFSf7xkBc8FYRMBOSdMTNgqpGRqnC8YSWm8oiiDnexl8L5wNKWa1qo0GhBj5l4un2zBBMvDb1J9HZBZApYZBScYSyF5RTLXZAn58HY9oBZCrLu8kjWy9I8DHoNpIOfdhFlEWahabFy96LUUwpOnd3abpaGZB6lcdNkZBtkwqNbbckuthATK78RJoPVYw43Pvuwrj42LTfkA5ZAeYZB8Ceg9XtW3a8S7ZCU3KbZBgJHJRZCH7YX6IZD";

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
        let list_id = await List.findOne({});
        let newSession = {
            pin: "abcd",
            listID: list_id._id,
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