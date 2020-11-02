var http = require("http");
const loginModule = require('./helpers/loginhelper.js');



test('Mock Login', done => {
    const mockCallback = jest.fn();
    loginModule.loginHelper("1234", "5678", "testres", mockCallback);
    expect(mockCallback.mock.calls.length).toBe(1);
})

test('Create a session', done => {
    const data = JSON.stringify({
        facebookToken: "EAALsZAFPkrZAUBAL6aMB2kFSf7xkBc8FYRMBOSdMTNgqpGRqnC8YSWm8oiiDnexl8L5wNKWa1qo0GhBj5l4un2zBBMvDb1J9HZBZApYZBScYSyF5RTLXZAn58HY9oBZCrLu8kjWy9I8DHoNpIOfdhFlEWahabFy96LUUwpOnd3abpaGZB6lcdNkZBtkwqNbbckuthATK78RJoPVYw43Pvuwrj42LTfkA5ZAeYZB8Ceg9XtW3a8S7ZCU3KbZBgJHJRZCH7YX6IZD"
    })

    var options = {
        host: 'localhost',
        path: '/session',
        port: '8081',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
          }
      };

    
    const req = http.request(options, res => {
        expect(res.statusCode).toBe(201);
        res.on('data', d => {
            process.stdout.write(d)
        })
        done();
    })
      
    req.on('error', error => {
        console.error(error);
    })

    req.write(data);
    req.end();
});

test('Login', done => {
    const data = JSON.stringify({
        firebaseToken: '0',
        facebookToken: "EAALsZAFPkrZAUBAL6aMB2kFSf7xkBc8FYRMBOSdMTNgqpGRqnC8YSWm8oiiDnexl8L5wNKWa1qo0GhBj5l4un2zBBMvDb1J9HZBZApYZBScYSyF5RTLXZAn58HY9oBZCrLu8kjWy9I8DHoNpIOfdhFlEWahabFy96LUUwpOnd3abpaGZB6lcdNkZBtkwqNbbckuthATK78RJoPVYw43Pvuwrj42LTfkA5ZAeYZB8Ceg9XtW3a8S7ZCU3KbZBgJHJRZCH7YX6IZD"
    })

    var options = {
        host: 'localhost',
        path: '/session',
        port: '8081',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
          }
      };

    
    const req = http.request(options, res => {
        expect(res.statusCode).toBe(201);
        res.on('data', d => {
            process.stdout.write(d)
        })
        done();
    })
      
    req.on('error', error => {
        console.error(error);
    })

    req.write(data);
    req.end();
});
