require("dotenv").config();

jest.mock("../../plugins/unsplash");

const listHelper = require("../../controllers/list");
const dbHelper = require("../db/mongodb");

const List = require("../../models/list");
const User = require("../../models/user");

const mockRequest = () => {
    const req = {};
    req.params = {};
    req.body = {};
    return req;
};

const mockResponse = () => {
    const res = {};
    res.body = {};
    res.status = jest.fn().mockReturnValue(res);
    // res.send = jest.fn().mockReturnValue(res);
    res.send = (result) => {
        res.body = JSON.parse(JSON.stringify(result));
    };

    res.locals = {};
    return res;
};

const TestUserID = "FacebookId123";

const testList1 = {
    userID: TestUserID,
    name: "TestList-FakeID",
    ideas: [
        {
            name: "Idea1",
            description: "This is an idea",
            picture: "https://fakeimage.com",
        },
    ],
};

const testList2 = {
    userID: "quickpick.admin",
    name: "TestList-Default",
    ideas: [
        {
            name: "Idea1",
            description: "This is an idea",
            picture: "https://fakeimage.com",
        },
    ],
};

const testList3 = {
    userID: TestUserID,
    name: "TestList-NewList",
    ideas: [
        {
            name: "Idea1",
            description: "This is an idea",
            picture: "https://fakeimage.com",
        },
    ],
};

const testList4 = {
    userID: "UpdateTester",
    name: "Changemyname",
    description: "Changemeplease",
    ideas: [
        {
            name: "Idea1",
            description: "This is an idea",
            picture: "https://fakeimage.com",
        },
    ],
};

const testList5 = {
    userID: "DeleteTester",
    name: "Deleteme",
    description: "IwantToBeFree",
    ideas: [
        {
            name: "Idea1",
            description: "This is an idea",
            picture: "https://fakeimage.com",
        },
    ],
};

beforeAll(async () => {
    await dbHelper.connect();

    /* Clear out the database */
    await List.deleteMany({});
    await User.deleteMany({});

    await User.create({
        id: TestUserID,
        name: "TestUserX",
        firebaseToken: "FakeTokenX",
    });
    
    await List.create(testList1);
    await List.create(testList2);
    await List.create(testList4);
    await List.create(testList5);
});

afterAll(async () => {
    await dbHelper.close();
});

describe("Get All Accessible Lists", () => {
    it("Success", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;

        await listHelper.getMyLists(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.body.lists.map((l) => l.name)).toEqual([
            "TestList-Default",
            "TestList-FakeID"
        ]);
    });
});

describe("Get Specific List", () => {
    it("Unauthorized Access to Someone's List", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();
        
        const myList = await List.findOne({ name: "TestList-FakeID" });
        req.params.id = myList._id;
        res.locals.id = "BadID";

        await listHelper.getList(req, res);
        
        expect(res.status).toHaveBeenCalledWith(403);
    });
    
    it("Retrieve Personal List", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();
        
        let myList = await List.findOne({ name: "TestList-FakeID" });
        req.params.id = myList._id;
        res.locals.id = TestUserID;

        await listHelper.getList(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.body.name).toEqual(myList.name);
    });

    it("Attempt to Get Non-Existent List", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();
        
        req.params.id = "AmIevenReal";
        res.locals.id = TestUserID;

        await listHelper.getList(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe("Create a List", () => {
    it("Success", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();

        req.body.list = testList3;
        res.locals.id = TestUserID;

        await listHelper.createList(req, res);
        
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.body.name).toEqual(testList3.name);
    });

    it("Null Parameter", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();

        // req.body.list = testList3;
        res.locals.id = TestUserID;

        await listHelper.createList(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe("Update a List", () => {
    it("Success - Basic", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();

        const myList = await List.findOne({"name": "Changemyname"});

        req.body.list = {
            name: "newName",
            description: "newDesc",
            ideas: [
                {
                    name: "newIdeaName"
                }
            ]
        };
        req.params.id = myList._id;
        res.locals.id = "UpdateTester";

        await listHelper.updateList(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.body.name).toEqual("newName");
        expect(res.body.description).toEqual("newDesc");
        expect(res.body.ideas[0].name).toEqual("newIdeaName");
    });
    it("Success - No update to name", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();

        const myList = await List.findOne({"name": "newName"});

        req.body.list = {
            name: "",
            description: "newDesc",
            ideas: [
                {
                    name: "newIdeaName"
                }
            ]
        };
        req.params.id = myList._id;
        res.locals.id = "UpdateTester";

        await listHelper.updateList(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.body.name).toEqual("newName");
        expect(res.body.description).toEqual("newDesc");
        expect(res.body.ideas[0].name).toEqual("newIdeaName");
    });
    it("Attempt to update someone else's list", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();

        const myList = await List.findOne({"name": "TestList-FakeID"});

        req.body.list = {
            name: "newName",
            description: "newDesc",
            ideas: [
                {
                    name: "newIdeaName"
                }
            ]
        };
        req.params.id = myList._id;
        res.locals.id = "UpdateTester";

        await listHelper.updateList(req, res);
        
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("Null list argument", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();

        const myList = await List.findOne({"name": "TestList-FakeID"});

        req.params.id = myList._id;
        res.locals.id = "UpdateTester";

        await listHelper.updateList(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe("Delete a List", () => {
    it("Success", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();

        const myList = await List.findOne({"name": testList5.name});

        req.params.id = myList._id;
        res.locals.id = "DeleteTester";

        await listHelper.deleteList(req, res);
        
        const ghostList = await List.findOne({"name": testList5.name})
                                    .catch(() => { return null; });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(ghostList).toEqual(null);
    });

    it("Attempt to delete someone else's list", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();

        const myList = await List.findOne({"name": testList1.name});

        req.params.id = myList._id;
        res.locals.id = "DeleteTester";

        await listHelper.deleteList(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
    });
});
