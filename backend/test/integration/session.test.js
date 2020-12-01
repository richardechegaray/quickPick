const request = require("supertest");
const app = require("../../app");

require("dotenv").config();

const dbHelper = require("../db/mongodb");

const User = require("../../models/user");
const Session = require("../../models/session");
const List = require("../../models/list");

const facebookToken = "EAALsZAFPkrZAUBAO5AdNmEesraFKVzn5shZBtUJIFZAMjA2r6dDgZAHRZA22g9JcWVXjd1gyjw8PvSQaFtexH04Kzl2dyfUdR3cu7FbYMgiGJGP5bWoaRQITqZByqFslzW4M2ZBBBIkyiQJksMkLA7kU8D8HX1lwEPMbEM4G9lxO0D8e80iXUZB8x";

let sessionPin = "";
let newUser = {
    name: "Buyonacy Changstein",
    id: "100722321844479",
    preferences: Array(20).fill("Pizza"),
};
let testListID = "";

beforeEach(async () => {
    await dbHelper.connect();

    /* Clear out the database */
    await Session.deleteMany({});
    await User.deleteMany({});
    await List.deleteMany({});

    
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
        results: [{idea: {name: "Mexican"}, score: 0},{idea: {name: "Italian"}, score: 0},{idea: {name: "French"}, score: 0},],
        participants: [{
            name: "Buyonacy Changstein",
            id: newUser.id,
        }]
    };
    testListID = myList._id;
    await Session.create(newSession);
    
});

afterAll(async () => {
    await dbHelper.close();
});

describe("Create Session", function () {
    it("User has not logged in before", async (done) => {
        await User.deleteMany({});
        const response = await request(app).post("/session/").set({ facebookToken }).send({});
        expect(response.status).toBe(400);
        done();
    });

    it("Success", async (done) => {
        const response = await request(app).post("/session/").set({ facebookToken }).send({});
        expect(response.status).toBe(201);
        done();
    });
});

describe("Get Session", function () {
    it("Session doesn't exist", async (done) => {
        const response = await request(app).get("/session/1234").set({facebookToken}).send({});
        expect(response.status).toBe(404);
        done();
    });

    it("User is not in session", async (done) => {
        await Session.findOneAndUpdate({ pin: "abcd" }, { participants: [] });
        const response = await request(app).get("/session/abcd").set({facebookToken}).send({});
        expect(response.status).toBe(401);
        done();
    });

    it("Success", async (done) => {
        const response = await request(app).get("/session/abcd").set({facebookToken}).send({});
        expect(response.status).toBe(200);
        done();
    });
});

describe("Add user to session", function () {
    it("Session doesn't exist", async (done) => {
        const response = await request(app).post("/session/1234").set({facebookToken}).send({});
        expect(response.status).toBe(404);
        done();
    });

    it("User is already in session or full", async (done) => {
        const response = await request(app).post("/session/abcd").set({facebookToken}).send({});
        expect(response.status).toBe(400);
        done();
    });

    it("Session has started", async (done) => {
        await Session.findOneAndUpdate({ pin: "abcd" }, { status: "running" });
        const response = await request(app).post("/session/abcd").set({facebookToken}).send({});
        expect(response.status).toBe(400);
        done();
    });

    it("Success", async (done) => {
        await Session.findOneAndUpdate({ pin: "abcd" }, { participants: [] });
        const response = await request(app).post("/session/abcd").set({facebookToken}).send({});
        expect(response.status).toBe(200);
        done();
    });
});

describe("Update session list", function () {
    it("Invalid listID", async (done) => {
        const response = await request(app).put("/session/abcd").set({facebookToken}).send({listID: "1234"});
        expect(response.status).toBe(400);
        done();
    });

    it("List does not exist", async (done) => {
        const response = await request(app).put("/session/abcd").set({facebookToken}).send({listID: "44444f31dcd5af2ff413441b"});
        expect(response.status).toBe(404);
        done();
    });

    it("Session doesn't exist", async (done) => {
        const response = await request(app).put("/session/1234").set({facebookToken}).send({listID: "44444f31dcd5af2ff413441b"});
        expect(response.status).toBe(404);
        done();
    });

    it("Success", async (done) => {
        await Session.findOneAndUpdate({ pin: "abcd" }, {listID: "" });
        const response = await request(app).put("/session/abcd").set({facebookToken}).send({listID: testListID});
        expect(response.status).toBe(200);
        done();
    });
});

describe("Get session list", function () {
    it("User is not in session", async (done) => {
        await Session.findOneAndUpdate({ pin: "abcd" }, { participants: [] });
        const response = await request(app).get("/session/abcd/list").set({facebookToken}).send({});
        expect(response.status).toBe(401);
        done();
    });

    it("Success does not exist", async (done) => {
        const response = await request(app).get("/session/1234/list").set({facebookToken}).send({});
        expect(response.status).toBe(400);
        done();
    });

    it("Success", async (done) => {
        const response = await request(app).get("/session/abcd/list").set({facebookToken}).send({});
        expect(response.status).toBe(200);
        done();
    });
});

describe("Start session", function () {
    it("Session does not exist", async (done) => {
        const response = await request(app).post("/session/1234/run").set({facebookToken}).send({});
        expect(response.status).toBe(404);
        done();
    });

    it("User is not owner", async (done) => {
        await Session.findOneAndUpdate({ pin: "abcd" }, { creator: "notyou" });
        const response = await request(app).post("/session/abcd/run").set({facebookToken}).send({});
        expect(response.status).toBe(400);
        done();
    });

    it("Invalid list ID", async (done) => {
        await Session.findOneAndUpdate({ pin: "abcd" }, { listID: "" });
        const response = await request(app).post("/session/abcd/run").set({ facebookToken });
        expect(response.status).toBe(400);
        done();
    });

    it("Success", async (done) => {
        const response = await request(app).post("/session/abcd/run").set({ facebookToken });
        expect(response.status).toBe(200);
        done();
    });
});

describe("Receive choices", function () {
    it("Invalid params", async (done) => {
        const response = await request(app).post("/session/1234/choices").set({ facebookToken }).send({
            choices: [
                {
                    idea: { 
                        name: "Italian" 
                    }, 
                    choice: true
                },
                {
                    idea: { 
                        name: "French" 
                    }, 
                    choice: false
                },
                {
                    idea: { 
                        name: "Mexican" 
                    }, 
                    choice: true
                }
            ]
        });

        expect(response.status).toBe(400);
        done();
    });

    it("User is not in session", async (done) => {
        await Session.findOneAndUpdate({ pin: "abcd" }, { participants: [] });
        const response = await request(app).post("/session/abcd/choices").set({ facebookToken }).send({
            choices: [
                {
                    idea: { name: "Italian" }, choice: true
                },
                {
                    idea: { name: "French" }, choice: false
                },
                {
                    idea: { name: "Mexican" }, choice: true
                }
            ]
        });
        expect(response.status).toBe(403);
        done();
    });

    it("Success, complete", async (done) => {
        await Session.findOneAndUpdate({ pin: "abcd" }, { status: "running", participants: [{name: "Buyonacy Changstein", id: newUser.id, }] });
        const response = await request(app).post("/session/abcd/choices").set({ facebookToken }).send({
            choices: [
                {
                    idea: { name: "Italian" }, choice: true
                },
                {
                    idea: { name: "French" }, choice: false
                },
                {
                    idea: { name: "Mexican" }, choice: true
                }
            ]
        });
        expect(response.status).toBe(200);
        done();
    });

    it("Success, complete, preferences", async (done) => {
        await Session.findOneAndUpdate({ pin: "abcd" }, { status: "running", participants: [{name: "Buyonacy Changstein", id: newUser.id, }] });
        let choices = [
            {
                idea: { name: "Italian" }, choice: true
            },
            {
                idea: { name: "French" }, choice: false
            },
            {
                idea: { name: "Mexican" }, choice: true
            }
        ];

        let response = await request(app).post("/session/abcd/choices").set({ facebookToken }).send({choices});
        expect(response.status).toBe(200);

        await Session.findOneAndUpdate({ pin: "abcd" }, { complete: 0, status: "running", participants: [{name: "Buyonacy Changstein", id: newUser.id, }] });
        response = await request(app).post("/session/abcd/choices").set({ facebookToken }).send({choices});
        expect(response.status).toBe(200);
        done();
    });

    it("Success, not complete", async (done) => {
        await Session.findOneAndUpdate({ pin: "abcd" }, { status: "running", participants: [{name: "Buyonacy Changstein", id: newUser.id, }, {name: "Murphy", id: "123456"}] });
        const response = await request(app).post("/session/abcd/choices").set({ facebookToken }).send({
            choices: [
                {
                    idea: { name: "Italian" }, choice: true
                },
                {
                    idea: { name: "French" }, choice: false
                },
                {
                    idea: { name: "Mexican" }, choice: true
                }
            ]
        });
        expect(response.status).toBe(200);
        done();
    });
});