const request = require("supertest");
const app = require("../../app");

const User = require("../../models/user");

const dbHelper = require("../db/mongodb");

describe("Login Integration Tests", () => {
    const testToken1 = "EAALsZAFPkrZAUBAKBruY4udFR1yLOyzTm3Wj8dPPJvr3ktDO5sFuAh5BxWcf97bI2UIRjLJfw0jrI7d9E0XfRtT7fQepRbqoZCnLY3m2BGZBo3KUeEZAZAigrzVv7ZCxjI6ypVIhAGrrLIuSE9iRZCJPi4i1GbHsj5ti7hah4oZB7Q9Hyaowzm22lFLeRp1SMsesXZCjiNSySkfQKgrhtQKKxv";

    const invalidToken = "EAALsZAFPkrZAUBAKn9XDhw76qLhMHZB2pnQblNwhuqMZBg2mnp13PJzMEPsvug87fl34RmdQEIxGtYWAKd55xOvIE5uejN8gWjNYX8sHoCC88tsIjWT0R45792jyfgbFZChjzbVgayuwhdN7bBUswn3mBJ8ZCE0nARZAX5XsJmwpGq63L3GLhj3aAB5P6GFrytVNY3cUoZBqywzDvpZCx8bSZC";

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

    test("Login - User does not exist yet", async () => {
        await User.deleteMany({});
        const response = await request(app)
                        .post("/login")
                        .set("facebookToken", testToken1)
                        .send({
                            firebaseToken: testUser1.firebaseToken,
                        });

        expect(response.statusCode).toBe(201);
        // Now check that the user was created
        const newUser = await User.findOne({ name: testUser1.name });
        expect(newUser.firebaseToken).toEqual(testUser1.firebaseToken);
    });

    test("Login - User exists and firebase token doesn't need update", async () => {
        await User.deleteMany({});
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
        await User.deleteMany({});
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
    
    test("Login - User passes an expired token", async () => {
        await User.deleteMany({});
        await User.create(testUser1);
        const response = await request(app)
            .post("/login")
            .set("facebookToken", invalidToken)
            .send({
                firebaseToken: testUser1.firebaseToken,
            });
        expect(response.statusCode).toBe(401);
    });
    
    test("Login - User passes an improperly formatted token", async () => {
        await User.deleteMany({});
        await User.create(testUser1);
        const response = await request(app)
            .post("/login")
            .set("facebookToken", "badString")
            .send({
                firebaseToken: testUser1.firebaseToken,
            });
        expect(response.statusCode).toBe(401);
    });
});

