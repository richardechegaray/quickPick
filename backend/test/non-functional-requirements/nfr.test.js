require("dotenv").config();
const axios = require("axios");
const performance = require('perf_hooks').performance;

let serverUrl = "http://52.52.51.125:8081/"

async function testMassJoin(tokens, pin) {
    var session_url = serverUrl + "session/" + pin;
    for (var i = 0; i < tokens.length; i++) {
        await axios.post(session_url, Object(), { headers: { 'facebooktoken': tokens[i] } });
    }
    var max_users = await axios.get(session_url, { headers: { 'facebooktoken': tokens[0] } })
        .then((sessionResponse) => {
            return sessionResponse.data.participants.length;
        });
    return max_users;
}

async function createSession(token) {
    var create_session_url = serverUrl + "session";
    return axios.post(create_session_url, Object(), { headers: { 'facebooktoken': token } })
        .then((newSession) => {
            return newSession.data.pin;
        });
}

async function getTokens(numTokens) {
    var appAccessToken = await axios.get(`https://graph.facebook.com/oauth/access_token?client_id=${process.env.FB_APP_ID}&client_secret=${process.env.FB_APP_SECRET}&grant_type=client_credentials`)
        .then((facebookResponse) => {
            return facebookResponse.data.access_token;
        });
    return axios.get(`https://graph.facebook.com/v9.0/822865601801621/accounts/test-users?fields=access_token&limit=${numTokens}&access_token=${appAccessToken}`)
        .then((facebookResponse) => {
            return facebookResponse.data.data.map(user => user["access_token"]);
        });
}

describe.skip("Non-functional Requirements Tests", function () {
    it("should allow 50+ users to join the session", async () => {
        var numUsers = 55;
        const tokens = await getTokens(numUsers);
        const pin = await createSession(tokens[0]);
        expect(await testMassJoin(tokens.slice(1,), pin)).toBeGreaterThanOrEqual(numUsers);
    });

    it("should have per request latency of < 400ms", async () => {
        const tokens = await getTokens(1);
        var numRequests = 10;
        var startTime = performance.now();
        for (var i = 0; i < numRequests; i++) {
            await createSession(tokens[0]);
        }
        expect(performance.now() - startTime).toBeLessThanOrEqual(numRequests * 400);
    });
});
