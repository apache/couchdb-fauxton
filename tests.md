# Tests

Fauxton has both **unit tests**, implemented with [Jest](https://facebook.github.io/jest/), and **end-to-end tests** using [Nightwatch](http://nightwatchjs.org/) against Selenium.

## Unit tests

To run all tests:

    npm run test
    
You can run only specific tests by providing a pattern or filename.

E.g.: to run tests in the `filename.test.js` file:

    npm run test -- filename.test.js

E.g.: to run tests under the `addons/cors` path:

    npm run test -- addons/cors

## End-to-end tests

To run selenium locally you need Docker installed. Selenium runs in a Docker container and connects to a CouchDB instance in another container. To start them run the command:

    npm run docker:up

You can run `npm run docker:logs` to see when the CouchDB instance is ready to go. You also need a Fauxton server instance runnning:

    grunt debugDev && DIST=./dist/debug ./bin/fauxton

Finally to run the tests:

    grunt nightwatch

Or to run only one file:

    grunt nightwatch --file=viewEdit

View the package.json `scripts` section for some other useful docker commands.

### Debugging Selenium tests

To debug and view a failing selenium test, you need to run the selenium container with vnc built into it:

    npm run docker:debug-up

Once it is up and running you can connect to it with any VNC client on `127.0.0.1:5900`. On MacOSX open safari
and type `vnc://127.0.0.1:5900`. That will open screen sharing. It will then prompt for the password which is `secret`.

After that run a Fauxton server instance and the nightwatch tests you want to debug.


### Omitting Nightwatch tests

If you need to omit particular tests from running you can add a `testBlacklist` option to the nightwatch section of
your settings.json file. That defines an object of the following form:

```javascript
// ...
"nightwatch": { 
  // ...
  "testBlacklist": {
    "documents": ["*"],
    "databases": [
      "checkDatabaseTooltip.js",
      "createsDatabase.js"
    ]
  }
}
// ...

```

The properties (`documents`, `databases`) map to a particular addon folder name (see `app/addons`). The values
should be an array of tests that you don't want to run. `*` will flag all tests from being ran, otherwise you
just enter the names of the files to omit.

### Cleaning up old tests

Each test run generates a new database. Sometimes these databases will not be removed. You can run `npm run remove-test-dbs` to clean up any left over databases.
