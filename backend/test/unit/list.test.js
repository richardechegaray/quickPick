require("dotenv").config();
const { MongoClient } = require("mongodb");

const listHelper = require("../../controllers/list");
const dbHelper = require("../db/mongodb");

const List = require("../../models/list");
const User = require("../../models/user");

describe("Unit tests for list functionalities", () => {
    let TestUserID = "FacebookId123";

    const mockRequest = () => {
        return {};
    };
    
    const mockResponse = () => {
        const res = {};
        res.body = {};
        res.status = jest.fn().mockReturnValue(res);
        // res.send = jest.fn().mockReturnValue(res);
        res.send = (result) => {
            res.body = result;
        };

        res.locals = {};
        return res;
    
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

        await List.create({
            userID: TestUserID,
            name: "TestList-FakeID",
            ideas: [
                {
                    name: "Idea1",
                    description: "This is an idea",
                    picture: "https://fakeimage.com",
                },
            ],
        });

        await List.create({
            userID: "quickpick.admin",
            name: "TestList-Default",
            ideas: [
                {
                    name: "Idea1",
                    description: "This is an idea",
                    picture: "https://fakeimage.com",
                },
            ],
        });
    });

    afterAll(async () => {
        await dbHelper.close();
    });

    it("Get List - Basic", async () => {
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
