const request = require("supertest");
const app = require("../../app");

const User = require("../../models/list");

const dbHelper = require("../db/mongodb");

describe("List Integration Tests", () => {
    const testToken = "EAALsZAFPkrZAUBAKn9XDhw76qLhMHZB2pnQblNwhuqMZBg2mnp13PJzMEPsvug87fl34RmdQEIxGtYWAKd55xOvIE5uejN8gWjNYX8sHoCC88tsIjWT0R45792jyfgbFZChjzbVgayuwhdN7bBUswn3mBJ8ZCE0nARZAX5XsJmwpGq63L3GLhj3aAB5P6GFrytVNY3cUoZBqywzDvpZCx8bSZC";

    beforeAll(async () => {
        await dbHelper.connect();

        await User.deleteMany({});
        await User.create({
            "id": "108059947763278",
            "name": "Ava Alefgghaihiec Narayananberg",
            "firebaseToken": "fShkKu_RRzCffP4UL5gMQp:APA91bFPA94a5ZIzo55amVGkEEdISjZoz28avCV018IF2yBWNOBYz2GENAIIUZTnpaBfBUj9qjI2dNR7WS9mdgS4Ge4lMIPyuook8pXy1rCJlrc8adgielahzPlRWYISaqnJSSIxWx8j"
        });
    });

    afterAll(async () => {
        await dbHelper.close();
    })

    test("Post to login endpoint", async () => {
    const response = await request(app)
                        .post("/login")
                        .set("facebookToken", testToken)
                        .send({
                            firebaseToken: "fakeToken",
                        });


    expect(response.statusCode).toBe(200);
    });
});

