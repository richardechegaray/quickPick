const request = require("supertest");
const app = require("../../app");

const Session = require("../../models/session");
const List = require("../../models/list");
const Image = require("../../models/image");

const dbHelper = require("../db/mongodb");

describe("List Integration Tests", () => {
    const testToken = "EAALsZAFPkrZAUBAOgxeBByLz4Bttbz9fjEYxEoFUvHTHKHOsyxY1ECj5JRQ18Bo32oZBa4DdIpAYcsSzMxtFJy5zWdJBHGwJ3OttHr6VAxiac9fJQVHkY0xqwZAGzv067XIn7stSGmsFCGICzKexnDRbZA9YZANMGEzqLui37dkVX1tVNtOoWyUyPSrzkZBpyFEtIT44pnwLFs4eCIpsXH9";
    const sessionPin = "DhAy0";

    const testList1 = {
        userID: "100722321844479",
        name: "TestList1",
        ideas: [
            {
                name: "Idea1",
                description: "This is an idea",
                picture: "https://fakeimage.com",
            },
        ],
    };
    const testList2 = {
        userID: "604987654321",
        name: "TestList2",
        ideas: [
            {
                name: "Idea1",
                description: "This is an idea",
                picture: "https://fakeimage.com",
            },
        ],
    };
    
    const testList3 = {
        userID: "quickpick.admin",
        name: "TestList3",
        ideas: [
            {
                name: "Idea1",
                description: "This is an idea",
                picture: "https://fakeimage.com",
            },
        ],
    };

    const image1 = {
        name: "dog",
        urls: "https://cacheddogurl.com"
    };

    beforeAll(async () => {
        await dbHelper.connect();

        await List.deleteMany({});
        await List.create(testList1);
        await List.create(testList2);
        await List.create(testList3);

        await Session.deleteMany({});
        await Session.create({
            "status": "lobby",
            "pin": sessionPin,
            "listID": "5fa5abe530d1c20c38a83d72",
            "listName": "Group Activities",
            "creator": "3591549284238798",
            "complete": 0,
            "size": 6,
            "results": [],
            "participants": [],
        });

        await Image.deleteMany({});
        await Image.create(image1);
    });

    afterAll(async () => {
        await dbHelper.close();
    });

    test("Set session's list", async () => {
    const myList = await List.findOne({ name: "TestList1" });

    const response = await request(app)
                        .put(`/session/${sessionPin}`)
                        .set("facebookToken", testToken)
                        .send({
                            listID: myList._id,
                        });


    expect(response.statusCode).toBe(200);
    expect(response.body.listID).toEqual(String(myList._id));
    });

    test("Get specific list", async () => {
        const myList = await List.findOne({ name: "TestList1" });
        
        const response = await request(app)
                            .get(`/list/${myList._id}`)
                            .set("facebookToken", testToken)
                            .send();
    
    
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toEqual(String(myList._id));
    });
    
    test("Get specific list - Unauthorized Invalid Token", async () => {
        const myList = await List.findOne({ name: "TestList1" });
        
        const response = await request(app)
                            .get(`/list/${myList._id}`)
                            .send(); // No token in header
    
        expect(response.statusCode).toBe(401);
    });

    test("Get specific list - Restrict access to list", async () => {
        const myList = await List.findOne({ name: "TestList2" });
        
        const response = await request(app)
                            .get(`/list/${myList._id}`)
                            .set("facebookToken", testToken)
                            .send();
    
        expect(response.statusCode).toBe(403);
    });
    
    test("Get specific list - List Doesn't exist", async () => {
        const response = await request(app)
                            .get("/list/fakeIdFoobar")
                            .set("facebookToken", testToken)
                            .send();
    
        expect(response.statusCode).toBe(404);
    });

    test("Get all viewable lists - Basic", async () => {
        const myList = await List.findOne({ name: "TestList1" });
        const publicList = await List.findOne({ name: "TestList3" });
        
        const response = await request(app)
                            .get("/list")
                            .set("facebookToken", testToken)
                            .send(); // No token in header
    
        expect(response.statusCode).toBe(200);
        expect(response.body.lists.length === 2);
        expect(response.body.lists.map((l) => l.name)).toEqual([
            myList.name,
            publicList.name,
        ]);
    });

    test("Create List - Basic", async () => {
        const newList = {
            name: "CreatedList1",
            ideas: [
                {
                    name: "dog",
                    description: "Someone get me a dog",
                    picture: "https://replacethis.com", // cached
                },
                {
                    name: "cat",
                    description: "Someone get me a cat",
                    picture: "https://replacethis.com", // not in cache
                },
            ],
        };
        
        const response = await request(app)
                            .post("/list")
                            .set("facebookToken", testToken)
                            .send({
                                list: newList,
                            });
    
        // Check that list exists in DB
        const resultList = await List.findOne({name: "CreatedList1"});
        expect(resultList); // Not null
        expect(resultList.name).toEqual("CreatedList1");
        expect(resultList.ideas.map((i) => i.name).toObject()).toEqual(["dog", "cat"]);
        expect(resultList.ideas[0].picture).toEqual("https://cacheddogurl.com");
        expect(response.statusCode).toBe(201);
    });

    test("Create List - Null List", async () => {        
        const response = await request(app)
                            .post("/list")
                            .set("facebookToken", testToken)
                            .send();
    
        expect(response.statusCode).toBe(400);
    });

});

