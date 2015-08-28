# Tests

Fauxton has both test coverage through unit and selenium tests, built on 
[Mocha](https://mochajs.org/) and [Nightwatch](http://nightwatchjs.org/) respectively.


## Unit Tests

You can run the Mocha unit tests via the command line or your browser.

Command line:

    grunt test

Browser: make sure the dev server is running, and enter the path (not URL) to your `runner.html` file in your browser.

    file://path/to/couchdb-fauxton/test/runner.html

Refreshing the URL will re-run the tests via PhantomJS and in the browser.


## Selenium tests

There is a bit of setup involved before you are able to run the Nightwatch selenium tests.

First, in your CouchDB admin accounts, add a user:

> user: tester  
password: testerpass  

Then on the command line:  

    npm install

Start Fauxton with

    grunt dev

And to run the tests (in another terminal tab):

    grunt nightwatch


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
