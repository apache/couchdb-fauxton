Fauxton
=======

Fauxton is the new Web UI for CouchDB. To get it running in development on your machine. Follow the steps below.

## Install via NPM

You can use the latest release of Fauxton via npm:

    npm install -g fauxton
    fauxton

See `fauxton --help` for extra options.

## CouchDB is Required

Install couchdb from docs here: http://couchdb.readthedocs.org/en/latest/install/index.html

## Setup Fauxton

A recent of [node.js](http://nodejs.org/) and npm is required.

### Fork this Repo

1. Fork this repo: https://github.com/apache/couchdb-fauxton.git
2. add upstream to the main git repo: `git remote add git-repo https://github.com/apache/couchdb-fauxton.git`
3. add upstream to the private apache repo: `git remote add upstream http://git-wip-us.apache.org/repos/asf/couchdb-fauxton.git`
4. `cd couchdb-fauxton`
5. `npm install`


### Install the grunt-cli
In case you don't have the Grunt command line interface installed, run the following command:

    npm install -g grunt-cli

If you run into a permissions problem, run that last command as an administrator:

    sudo npm install -g grunt-cli


### NOTE: Before you run Fauxton, don't forget to start CouchDB!

### Dev Server
Using the dev server is the easiest way to use Fauxton, specially when
developing for it. Copy or symlink the `settings.json.default` file if you'd like to see the `styletests` addon).

And then...

    grunt dev

You should be able to access Fauxton on `http://localhost:8000`

### Styleguide
We follow our coding-styleguide to make it easier for everyone to write, read and review code: [https://github.com/apache/couchdb-fauxton/blob/master/styleguide.md](https://github.com/apache/couchdb-fauxton/blob/master/styleguide.md)

### Prepare Fauxton Release
Follow the "Fauxton Setup" section, edit settings.json variable root where the document will live,
e.g. "/_utils/" then:

    grunt couchdb

This will install the latest version of Fauxton into `/share/www/`

### Running Tests

You can run the tests either via the command line or your browser.

Command line:

    grunt test

Browser: make sure the dev server is running, and enter the path (not URL) to your `runner.html` file in your browser.

    file://path/to/couchdb-fauxton/test/runner.html

Refreshing the URL will re-run the tests via PhantomJS and in the browser.

#### Nightwatch Functional Browser Tests

There is a bit of setup involved before you are able to run the Nightwatch tests.

In your CouchDB admin accounts, add a user:  

> user: tester  
password: testerpass  

Then on the command line:  

    npm install

Start fauxton with

    grunt dev

And to run the tests (in another terminal tab):

    grunt nightwatch

##### Omitting nightwatch tests

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


### To Deploy Fauxton

To deploy to your local [CouchDB instance](http://localhost:5984/fauxton/_design/fauxton/index.html):

    grunt couchapp_deploy

## (Optional) To avoid a npm global install
    # Development mode, non minified files
    npm run couchdebug

    # Or fully compiled install
    npm run couchdb

## Understanding the Fauxton Code Layout

Interested in writing learning more? Give [this file](code-layout.md) a read over for a little more information about 
how Fauxton's organized. 

Want to get involved? Check out [Jira](https://issues.apache.org/jira/browse/COUCHDB/component/12320406) for a list
of items to do.
