require("dotenv").config();
const { MongoClient } = require("mongodb");

const sessionHelper = require("../../controllers/session");
const dbHelper = require("../db/mongodb");

const List = require("../../models/list");
const User = require("../../models/user");
const session = require("../../controllers/session");
const Session = require("../../models/session");

/*
Mongodb setup*/

let TestUserID = "FacebookId123";
let TestUserID2 = "murphy";
let list_id = "";

const mockRequest = () => {
    const req = {
        body: {
            size: "",
            listID: "",
            choices: [],
        },
        params: {
            id: ""
        }
    };
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

    res.locals = {
        id: ""
    };
    return res;

};

beforeAll(async () => {
    await dbHelper.connect();

    /* Clear out the database */
    await Session.deleteMany({});
    await User.deleteMany({});
    await List.deleteMany({});

    /* We have one mock session, two mock users, and one mock list for testing */
    let newSession = {
        pin: "abcd",
        listID: "1234",
        status: "lobby",
        creator: TestUserID,
        complete: 0,
        size: 6,
        results: [],
        participants: [{
            name: "me",
            id: TestUserID,
        }]
    }
    await Session.create(newSession);

    let newUser = {
        name: "me",
        id: TestUserID
    }
    await User.create(newUser);
    let newUser1 = {
        name: "me2",
        id: TestUserID2
    }
    await User.create(newUser1);

    let list = {
        userID: TestUserID,
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

    list_id = (await List.findOne({}))._id;
    
});

afterAll(async () => {
    await dbHelper.close();
});

/*
Module Tests!
*/
describe("Create Session", function () {
    it("Invalid params", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.body.size = "one hundred thousand";

        await sessionHelper.createSession(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("Success", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.body.size = 6;

        await sessionHelper.createSession(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });
});

describe("Get Session", function () {
    it("Session doesn't exist", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.params.id = "one hundred thousand";

        await sessionHelper.getSession(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("User is not in session", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = "murphy";
        req.params.pin = "abcd"

        await sessionHelper.getSession(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("Success", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.params.pin = "abcd"

        await sessionHelper.getSession(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("Add user to session", function () {
    it("Session doesn't exist", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.params.id = "murphyisthecutest";

        await sessionHelper.addUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("User is already in session or full", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.params.id = "abcd";

        await sessionHelper.addUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("Success", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID2;
        req.params.id = "abcd";

        await sessionHelper.addUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("Update session list", function () {
    it("Invalid listID", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.params.id = "abcd";
        req.body.listID = 1000;

        await sessionHelper.updateList(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("Session doesn't exist", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.params.id = "10000";
        req.body.listID = list_id;

        await sessionHelper.updateList(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("Success", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.params.id = "abcd";
        req.body.listID = list_id;

        await sessionHelper.updateList(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("Get session list", function () {
    it("User is not in session", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID2;
        req.params.id = "abcd";

        await sessionHelper.getList(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("Success", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.params.id = "abcd";

        await sessionHelper.getList(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("Start session", function () {
    it("Session does not exist", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.params.id = "12300";

        await sessionHelper.startSession(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("User is not owner", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID2;
        req.params.id = "abcd";

        await sessionHelper.startSession(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("Success", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.params.id = "abcd";

        await sessionHelper.startSession(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe("Receive choices", function () {
    it("Invalid params", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.params.id = "10231";

        await sessionHelper.receiveChoices(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("Success", async () => {
        const req = mockRequest();
        const res = mockResponse();
        res.locals.id = TestUserID;
        req.params.id = "abcd";
        req.body.choices = [
            {
                idea: {name: "Italian"}, choice: true
            },
            {
                idea: {name: "French"}, choice: false
            },
            {
                idea: {name: "Mexican"}, choice: true
            },
        ];

        await sessionHelper.receiveChoices(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});