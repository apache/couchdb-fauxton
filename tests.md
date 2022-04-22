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

Nightwatch tests require that you have Chrome installed. If you prefer to use another browser, update `test/nightwatch_tests/nightwatch.json.underscore` and install the appropriate driver - see Nightwatch documentation for more details.

The tests also require a CouchDB server (see step 2).

1. Define the version of CouchDB to test against
```bash
COUCHDB_IMAGE=couchdb:3
NIGHTWATCH_SKIPTAGS="search,nonpartitioned,couchdb-v2-only"
-- OR --
COUCHDB_IMAGE=couchdb:2.3.1
NIGHTWATCH_SKIPTAGS="search,partitioned"
```
2. Start a CouchDB instance
```bash
npm run docker:up
```
(run `npm run docker:logs` to see when the CouchDB instance is ready to go)
3. Start Fauxton
```bash
grunt debugDev && DIST=./dist/debug ./bin/fauxton
```
4. Run the tests
```bash
grunt nightwatch
```

Or to run only one file:
```bash
grunt nightwatch --file=filename
```

View the package.json `scripts` section for other useful Docker commands.


### Omitting Nightwatch tests

If you need to omit particular tests from running you can add a `testBlacklist` option to the nightwatch section of
your settings.json file. It should define an object of the following form:

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
