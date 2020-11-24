const request = require("supertest");
const app = require("../../app");

const User = require("../../models/list");

const dbHelper = require("../db/mongodb");

describe("Login Integration Tests", () => {
    const testToken1 = "EAALsZAFPkrZAUBALPZCf8D65zGKfJV4ffmIHoDFDVqvURxt6ocNAY33ZBbr1JmNZC36Tlv4WJpMMsczvQVMg2iRZA2ON7fGGSOGb9d8BpZCfLKulCA2P80pOZCsrJtUTvC5rfGdx0RPQMVbSv6qQ5DfEfQrnqKQzzhd2g5YnBZAEss4lwOaAtZB9HucB0YIWJmL0WzpZBIMYBeqZBuFMZCxamIvvA";
    const testUser1 = {
        "id": "100722321844479",
        "name": "Buyonacy Changstein",
        "firebaseToken": "12345"
    };
    beforeAll(async () => {
        await dbHelper.connect();
        await User.deleteMany({});
    });

    afterAll(async () => {
        await dbHelper.close();
    });

    test("Login - User exists and firebase token doesn't need update", async () => {
        await User.deleteMany({ name: testUser1.name });
        await User.create(testUser1);
        const response = await request(app)
            .post("/login")
            .set("facebookToken", testToken1)
            .send({
                firebaseToken: testUser1.firebaseToken,
            });
        expect(response.statusCode).toBe(200);
    });

    test("Login - User exists and firebase token needs an update", async () => {
        await User.deleteMany({ name: testUser1.name });
        await User.create(testUser1);
        const response = await request(app)
            .post("/login")
            .set("facebookToken", testToken1)
            .send({
                firebaseToken: "foobar",
            });

        expect(response.statusCode).toBe(200);
        // Now check that the token was updated
        const newUser = await User.findOne({ name: testUser1.name });
        expect(newUser.firebaseToken).toEqual("foobar");
    });

    test("Login - User does not exist yet", async () => {
        await User.deleteMany({ name: testUser1.name });
        const response = await request(app)
                        .post("/login")
                        .set("facebookToken", testToken1)
                        .send({
                            firebaseToken: testUser1.firebaseToken,
                        });

        expect(response.statusCode).toBe(200);
        // Now check that the user was created
        const newUser = await User.findOne({ name: testUser1.name });
        expect(newUser.firebaseToken).toEqual(testUser1.firebaseToken);
    });
});

