Fauxton
=======

Fauxton is the new Web UI for CouchDB. To get it running in development on your machine. Follow the steps below.

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




### To Deploy Fauxton

To deploy to your local [CouchDB instance](http://localhost:5984/fauxton/_design/fauxton/index.html):

    grunt couchapp_deploy

## Understanding the Fauxton Code Layout

Each bit of functionality is its own separate module or addon. All core modules are stored under `app/module` and
any addons that are optional are under `app/addons`. We use [backbone.js](http://backbonejs.org/) and
[Backbone.layoutmanager](https://github.com/tbranyen/backbone.layoutmanager) quite heavily, so best to get an
idea how they work. It's best at this point to read through a couple of the modules and addons to get an idea
of how they work. Two good starting points are `app/addon/config` and `app/modules/databases`.
Each module must have a `base.js` file, this is read and compiled when Fauxton is deployed. A `resources.js` file
is usually used for your Backbone.Models and Backbone.Collections, `view.js` for your Backbone.Views.
The `routes.js` is used to register a URL path for your view along with what layout, data, breadcrumbs and api
point is required for the view.

Check out [writing_addons.md](writing_addons.md) for more information on writing your own addons.

## Todo Items

Want to get involved? Check out [Jira](https://issues.apache.org/jira/browse/COUCHDB/component/12320406) for a list
of items to do.

## (Optional) To avoid a npm global install
    # Development mode, non minified files
    npm run couchdebug

    # Or fully compiled install
    npm run couchdb
