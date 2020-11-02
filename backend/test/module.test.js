const loginModule = require("../helpers/loginhelper.js");
const auth = require("../middleware/authentication")

/*
---------Module Testing

*/
describe("User login and authentication", function(){
    it("Authenticating with facebook", (done) => {
      
      //Creating mock req and res
      var req = {
        body: {
          facebookToken: "EAALsZAFPkrZAUBAL6aMB2kFSf7xkBc8FYRMBOSdMTNgqpGRqnC8YSWm8oiiDnexl8L5wNKWa1qo0GhBj5l4un2zBBMvDb1J9HZBZApYZBScYSyF5RTLXZAn58HY9oBZCrLu8kjWy9I8DHoNpIOfdhFlEWahabFy96LUUwpOnd3abpaGZB6lcdNkZBtkwqNbbckuthATK78RJoPVYw43Pvuwrj42LTfkA5ZAeYZB8Ceg9XtW3a8S7ZCU3KbZBgJHJRZCH7YX6IZD"
        }
      }
      mockStatus = jest.fn();
      mockSend = jest.fn();
      mockJson = jest.fn();
      mockRes = {
        status: mockStatus,
        send: mockSend,
        json: mockJson,
        locals: {
          id: ""
        }
      };

      //Callback to check values in our mock functions
      function callback(){
        expect(mockRes.locals.id).not.toBe("")
        done();
      }

      auth.checkFB(req, mockRes, callback);
    });
    /*
    it("Checking if user has logged in before", () => {

    });
    it("Creating a new user", () => {

    });
    it("Update the firebase token", () => {

    });
    */
});

