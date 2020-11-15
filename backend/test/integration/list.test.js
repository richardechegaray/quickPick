const request = require("supertest");
const app = require("../../app");
const Session = require("../../models/session");

describe("User chooses list for session", () => {
    const testToken = "EAALsZAFPkrZAUBAKn9XDhw76qLhMHZB2pnQblNwhuqMZBg2mnp13PJzMEPsvug87fl34RmdQEIxGtYWAKd55xOvIE5uejN8gWjNYX8sHoCC88tsIjWT0R45792jyfgbFZChjzbVgayuwhdN7bBUswn3mBJ8ZCE0nARZAX5XsJmwpGq63L3GLhj3aAB5P6GFrytVNY3cUoZBqywzDvpZCx8bSZC";

    test("It should response the GET method", async () => {
    console.log(request);
    const response = await request(app)
                        .put("/session/")
                        .set(facebookToken, testToken)
                        .send({
                            listID: "Foobar"
                        });
    expect(response.statusCode).toBe(200);
  });
});