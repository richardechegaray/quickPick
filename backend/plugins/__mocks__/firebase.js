/* Module we want to mock */
const firebaseUtil = jest.createMockFromModule("./firebase");

/* Function in mocked modules we are mocking */
async function sendFirebase(body) {
    console.log(body);
    return;
}

/* Export the module */
firebaseUtil.sendFirebase = sendFirebase;
module.exports = firebaseUtil;
