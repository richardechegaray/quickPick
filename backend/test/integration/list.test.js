const request = require("supertest");
const app = require("../../app");

const Session = require("../../models/session");
const List = require("../../models/list");
const Image = require("../../models/image");

const dbHelper = require("../db/mongodb");

describe("List Integration Tests", () => {
    const testToken = "EAALsZAFPkrZAUBAO5AdNmEesraFKVzn5shZBtUJIFZAMjA2r6dDgZAHRZA22g9JcWVXjd1gyjw8PvSQaFtexH04Kzl2dyfUdR3cu7FbYMgiGJGP5bWoaRQITqZByqFslzW4M2ZBBBIkyiQJksMkLA7kU8D8HX1lwEPMbEM4G9lxO0D8e80iXUZB8x";
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

    it("Set session's list", async () => {
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

    it("Get specific list", async () => {
        const myList = await List.findOne({ name: "TestList1" });
        
        const response = await request(app)
                            .get(`/list/${myList._id}`)
                            .set("facebookToken", testToken)
                            .send();
    
    
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toEqual(String(myList._id));
    });
    
    it("Get specific list - Unauthorized Invalid Token", async () => {
        const myList = await List.findOne({ name: "TestList1" });
        
        const response = await request(app)
                            .get(`/list/${myList._id}`)
                            .send(); // No token in header
    
        expect(response.statusCode).toBe(401);
    });

    it("Get specific list - Restrict access to list", async () => {
        const myList = await List.findOne({ name: "TestList2" });
        
        const response = await request(app)
                            .get(`/list/${myList._id}`)
                            .set("facebookToken", testToken)
                            .send();
    
        expect(response.statusCode).toBe(403);
    });
    
    it("Get specific list - List Doesn't exist", async () => {
        const response = await request(app)
                            .get("/list/fakeIdFoobar")
                            .set("facebookToken", testToken)
                            .send();
    
        expect(response.statusCode).toBe(404);
    });

    it("Get all viewable lists - Basic", async () => {
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

    it("Create List - Basic", async () => {
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

    it("Create List - Null List", async () => {        
        const response = await request(app)
                            .post("/list")
                            .set("facebookToken", testToken)
                            .send();
    
        expect(response.statusCode).toBe(400);
    });

    it("Create List - Bad List (Internal Error)", async () => {        
        const response = await request(app)
                            .post("/list")
                            .set("facebookToken", testToken)
                            .send({
                                list: "die",
                            });
    
        expect(response.statusCode).toBe(500);
    });
    it("Update List - Basic", async () => {
        const newList = {
            name: "newName",
            description: "Where'd the cat go?",
            ideas: [
                {
                    name: "dog",
                    description: "Someone get me a dog",
                    picture: "https://replacethis.com", // cached
                },
                {
                    name: "bird",
                    description: "Someone get me a bird",
                    picture: "https://replacethis.com", // not in cache
                },
            ],
        };
        // List we are going to update
        const myList = await List.findOne({name: "CreatedList1"});

        const response = await request(app)
                            .put(`/list/${myList._id}`)
                            .set("facebookToken", testToken)
                            .send({
                                list: newList,
                            });
        
        const updatedList = await List.findById(myList._id).catch(() => null);
        expect(updatedList); // Not null
        expect(updatedList.name).toEqual("newName");
        expect(updatedList.ideas.map((i) => i.name).toObject()).toEqual(["dog", "bird"]);
        expect(updatedList.description).toEqual("Where'd the cat go?");
        expect(response.statusCode).toBe(200);
    });

    it("Update List - No Name", async () => {
        const newList = {
            name: "",
            description: "Where'd the cat go?",
            ideas: [
                {
                    name: "dog",
                    description: "Someone get me a dog",
                    picture: "https://replacethis.com", // cached
                },
                {
                    name: "bird",
                    description: "Someone get me a bird",
                    picture: "https://replacethis.com", // not in cache
                },
            ],
        };
        // List we are going to update
        const myList = await List.findOne({name: "newName"});

        const response = await request(app)
                            .put(`/list/${myList._id}`)
                            .set("facebookToken", testToken)
                            .send({
                                list: newList,
                            });
        
        const updatedList = await List.findById(myList._id).catch(() => null);
        expect(updatedList); // Not null
        expect(updatedList.name).toEqual("newName"); // Unchanged
        expect(updatedList.ideas.map((i) => i.name).toObject()).toEqual(["dog", "bird"]);
        expect(updatedList.description).toEqual("Where'd the cat go?");
        expect(response.statusCode).toBe(200);
    });
    
    it("Update List - No Access", async () => {
        const newList = {
            name: "newName",
            description: "Where'd the cat go?",
            ideas: [
                {
                    name: "dog",
                    description: "Someone get me a dog",
                    picture: "https://replacethis.com", // cached
                },
                {
                    name: "bird",
                    description: "Someone get me a bird",
                    picture: "https://replacethis.com", // not in cache
                },
            ],
        };
        // List we are going to update
        const myList = await List.findOne({name: "TestList2"});

        const response = await request(app)
                            .put(`/list/${myList._id}`)
                            .set("facebookToken", testToken)
                            .send({
                                list: newList,
                            });
        
        const updatedList = await List.findById(myList._id).catch(() => null);
        expect(updatedList); // Not null
        expect(updatedList.name).toEqual("TestList2"); // unchanged
        expect(response.statusCode).toBe(403);
    });
    it("Update List - Bad Parameters", async () => {
        const newList = {
            name: "newName2",
            description: "Should not be this",
        };
        // List we are going to update
        const myList = await List.findOne({name: "newName"});

        const response = await request(app)
                            .put(`/list/${myList._id}`)
                            .set("facebookToken", testToken)
                            .send({
                                list: newList,
                            });
        
        const updatedList = await List.findById(myList._id).catch(() => null);
        expect(updatedList); // Not null
        expect(updatedList.name).toEqual("newName"); // unchanged
        expect(updatedList.description).toEqual("Where'd the cat go?"); //unchanged
        expect(response.statusCode).toBe(400);
    });
    it("Delete List - Basic", async () => {
        // List we are going to update
        const myList = await List.findOne({name: "newName"});

        const response = await request(app)
                            .delete(`/list/${myList._id}`)
                            .set("facebookToken", testToken)
                            .send({});

        const updatedList = await List.findById(myList._id).catch(() => null);
        expect(!updatedList); // null
        expect(response.statusCode).toBe(200);
    });
    it("Delete List - Access Denied", async () => {
        // List we are going to update
        const myList = await List.findOne({name: "TestList2"});

        const response = await request(app)
                            .delete(`/list/${myList._id}`)
                            .set("facebookToken", testToken)
                            .send({});

        const updatedList = await List.findById(myList._id).catch(() => null);
        expect(updatedList); // not null
        expect(response.statusCode).toBe(403);
    });
});

