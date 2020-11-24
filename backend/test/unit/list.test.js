require("dotenv").config();

jest.mock("../../plugins/unsplash")

const listHelper = require("../../controllers/list");
const dbHelper = require("../db/mongodb");

const List = require("../../models/list");
const User = require("../../models/user");

describe("Unit tests for list functionalities", () => {
    const TestUserID = "FacebookId123";

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
    });

    afterAll(async () => {
        await dbHelper.close();
    });

    it("Get All Lists - Basic", async () => {
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

    it("Get Specific List - Attempt to access someone else's list", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();
        
        const myList = await List.findOne({ name: "TestList-FakeID" });
        req.params.id = myList._id;
        res.locals.id = "BadID";

        await listHelper.getList(req, res);
        
        expect(res.status).toHaveBeenCalledWith(403);
    });
    
    it("Get Specific List - Retrieve personal list", async () => {
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

    it("Get Specific List - Search for non-existent list", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();
        
        req.params.id = "AmIevenReal";
        res.locals.id = TestUserID;

        await listHelper.getList(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
    });
    
    it("Create List - Basic", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();

        req.body.list = testList3;
        res.locals.id = TestUserID;

        await listHelper.createList(req, res);
        
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.body.name).toEqual(testList3.name);
        console.log(res.body);
    });

    it("Create List - Null Parameter", async () => {
        /* Mock the Request and Response objects */
        const req = mockRequest();
        const res = mockResponse();

        // req.body.list = testList3;
        res.locals.id = TestUserID;

        await listHelper.createList(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        console.log(res.body);
    });
});
