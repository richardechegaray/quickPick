const request = require("supertest");
const app = require("../../app");

const Session = require("../../models/session");
const List = require("../../models/list");

const dbHelper = require("../db/mongodb");

describe("List Integration Tests", () => {
    const testToken = "EAALsZAFPkrZAUBAKn9XDhw76qLhMHZB2pnQblNwhuqMZBg2mnp13PJzMEPsvug87fl34RmdQEIxGtYWAKd55xOvIE5uejN8gWjNYX8sHoCC88tsIjWT0R45792jyfgbFZChjzbVgayuwhdN7bBUswn3mBJ8ZCE0nARZAX5XsJmwpGq63L3GLhj3aAB5P6GFrytVNY3cUoZBqywzDvpZCx8bSZC";

    const sessionPin = "DhAy0";

    const testList1 = {
        userID: "3591549284238798",
        name: "TestList1",
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

        await List.deleteMany({});
        await List.create(testList1);

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
    });

    afterAll(async () => {
        await dbHelper.close();
    })

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
});

