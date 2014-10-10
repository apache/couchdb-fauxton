Fauxton
=======

Fauxton is the new Web UI for CouchDB. To get it running in development on your machine. Follow the steps below.

## COUCHDB is required ##

Install couchdb from docs here: http://couchdb.readthedocs.org/en/latest/install/index.html

## Setup Fauxton ##

A recent of [node.js](http://nodejs.org/) and npm is required.

### FORK THIS REPO

    1. Fork the THIS repo: https://github.com/apache/couchdb-fauxton.git
    2. add upstream to the main git repo 'git remote add git-repo https://github.com/apache/couchdb-fauxton.git'
    2. add upstream to the private apache repo 'git remote add upstream http://git-wip-us.apache.org/repos/asf/couchdb-fauxton.git'
    3. cd couchdb-fauxton
    4. npm install


### Install the grunt-cli
In case you don't have the grunt command line interface installed, run the following command:

    npm install -g grunt-cli

If you run into a permissions problem, run that last command as an administrator:

    sudo npm install -g grunt-cli


### NOTE: Before you run fauxton, don't forget to start couchdb!

### Dev Server
Using the dev server is the easiest way to use fauxton, specially when
developing for it. Copy or symlink the `settings.json.default` file if you'd like to see the `styletests` addon).

And then...

    grunt dev

You should be able to access fauxton on `http://localhost:8000`

### Prepare Fauxton Release
    Follow the "Fauxton Setup" section,
    Edit settings.json variable root where the document will live.  eg.  "/_utils/fauxton/"

    then:

    grunt couchdb

    This will install the latest version of Fauxton into `/share/www/`

### Running Tests
    There are two ways to run the tests. `grunt test` will run the tests via the commandline. It is also possible to view them via the url
    `http://localhost:8000/testrunner` when the dev server is running. Refreshing the url will rerun the tests via phantomjs and in the browser.

### To Deploy Fauxton

    grunt couchapp_deploy - to deploy to your local [CouchDB instance] (http://localhost:5984/fauxton/_design/fauxton/index.html)

## Understanding the Fauxton Code layout

Each bit of functionality is its own separate module or addon. All core modules are stored under `app/module` and any addons that are optional are under `app/addons`.
We use [backbone.js](http://backbonejs.org/) and [Backbone.layoutmanager](https://github.com/tbranyen/backbone.layoutmanager) quite heavily, so best to get an idea how they work.
It's best at this point to read through a couple of the modules and addons to get an idea of how they work. Two good starting points are `app/addon/config` and `app/modules/databases`.
Each module must have a `base.js` file, this is read and compile when Fauxton is deployed. A `resource.js` file is usually for your Backbone.Models and Backbone.Collections,
`view.js` for your Backbone.Views. The `routes.js` is used to register a url path for your view along with what layout, data, breadcrumbs and api point is required for the view.

Check out [writing_addons.md](writing_addons.md) for more information on writing your own addons.

## Todo items

Checkout [Jira](https://issues.apache.org/jira/browse/COUCHDB/component/12320406) for a list of items to do.

## (Optional) To avoid a npm global install
    # Development mode, non minified files
    npm run couchdebug

    # Or fully compiled install
    npm run couchdb
