const loginModule = require("../helpers/loginhelper.js");
const auth = require("../middleware/authentication");
const { MongoClient } = require("mongodb");

/*
---------Module Testing

*/
describe("User login and authentication", () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGOURL, {
      useNewUrlParser: true,
    });
    db = await connection.db(process.env.DBNAME);
  });

  afterAll(async () => {
    await connection.close();
    await db.close();
  });

  it("Authenticating with facebook", (done) => {
    var req = {
      body: {
        facebookToken:
          "EAALsZAFPkrZAUBAL6aMB2kFSf7xkBc8FYRMBOSdMTNgqpGRqnC8YSWm8oiiDnexl8L5wNKWa1qo0GhBj5l4un2zBBMvDb1J9HZBZApYZBScYSyF5RTLXZAn58HY9oBZCrLu8kjWy9I8DHoNpIOfdhFlEWahabFy96LUUwpOnd3abpaGZB6lcdNkZBtkwqNbbckuthATK78RJoPVYw43Pvuwrj42LTfkA5ZAeYZB8Ceg9XtW3a8S7ZCU3KbZBgJHJRZCH7YX6IZD",
      },
    };
    mockStatus = jest.fn();
    mockSend = jest.fn();
    mockJson = jest.fn();
    mockRes = {
      status: mockStatus,
      send: mockSend,
      json: mockJson,
      locals: {
        id: "",
      },
    };

    //Callback to check values in our mock functions
    function callback() {
      expect(mockRes.locals.id).not.toBe("");
      done();
    }

    auth.checkFB(req, mockRes, callback);
  });

  it("Inserting and finding a user", async () => {
    const insertedUser = {
      _id: "auserid",
      id: 1234567890,
      name: "Test Guy",
      firebaseToken: "onehundredthousand",
    };
    await db.collection(process.env.USER_COLLECTION).insertOne(insertedUser);
    const foundUser = await db.collection(process.env.USER_COLLECTION).findOne({_id: "auserid"});
    expect(foundUser).toEqual(insertedUser);    
    await db.collection(process.env.USER_COLLECTION).deleteOne({_id: "auserid"});
  });
  /*
    it("Creating a new user", () => {

    });
    it("Update the firebase token", () => {

    });
    */
});
