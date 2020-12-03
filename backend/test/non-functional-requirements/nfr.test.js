require("dotenv").config();
const axios = require("axios");
const performance = require("perf_hooks").performance;

let serverUrl = "http://52.52.51.125:8081/";

async function testMassJoin(tokens, pin) {
    var sessionUrl = serverUrl + "session/" + pin;
    for (var i = 0; i < tokens.length; i++) {
        await axios.post(sessionUrl, Object(), { headers: { "facebooktoken": tokens[parseInt(i)] } });
    }
    var maxUsers = await axios.get(sessionUrl, { headers: { "facebooktoken": tokens[0] } })
        .then((sessionResponse) => sessionResponse.data.participants.length);
    return maxUsers;
}

async function createSession(token) {
    var createSessionUrl = serverUrl + "session";
    return axios.post(createSessionUrl, Object(), { headers: { "facebooktoken": token } })
        .then((newSession) => newSession.data.pin);
}

async function getTokens(numTokens) {
    var appAccessToken = await axios.get(`https://graph.facebook.com/oauth/access_token?client_id=${process.env.FB_APP_ID}&client_secret=${process.env.FB_APP_SECRET}&grant_type=client_credentials`)
        .then((facebookResponse) => {
            return facebookResponse.data.access_token;
        });
    return axios.get(`https://graph.facebook.com/v9.0/822865601801621/accounts/test-users?fields=access_token&limit=${numTokens}&access_token=${appAccessToken}`)
        .then((facebookResponse) => {
            return facebookResponse.data.data.map((user) => user["access_token"]);
        });
}

describe.skip("Non-functional Requirements Tests", function () {
    it("should allow 50+ users to join the session", async () => {
        jest.setTimeout(55000);
        var numUsers = 55;
        const tokens = await getTokens(numUsers);
        const pin = await createSession(tokens[0]);
        expect(await testMassJoin(tokens.slice(1,), pin)).toBeGreaterThanOrEqual(numUsers);
    });

    it("should have per request latency of < 400ms", async () => {
        jest.setTimeout(200000);
        const tokens = await getTokens(1);
        var numRequests = 200;
        var startTime = performance.now();
        for (var i = 0; i < numRequests; i++) {
            await createSession(tokens[0]);
        }
        expect(performance.now() - startTime).toBeLessThanOrEqual(numRequests * 400);
    });
});
