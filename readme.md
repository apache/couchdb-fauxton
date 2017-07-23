[![Build Status](https://travis-ci.org/apache/couchdb-fauxton.svg?branch=master)](https://travis-ci.org/apache/couchdb-fauxton)

# Fauxton


Fauxton is the new Web UI for CouchDB. To get it running in development on your machine. Follow the steps below.

## Install as standalone server via npm

You can use the latest release of Fauxton via npm:

    npm install -g fauxton
    fauxton

See `fauxton --help` for extra options.


## Setting up Fauxton

Please note that [node.js](http://nodejs.org/) and npm is required. Speciifcally, Fauxton requires at least Node 6 and npm 3.

1. make sure you have CouchDB installed. Instructions on how to install it can be  
[found here](http://couchdb.readthedocs.org/en/latest/install/index.html)
1. fork this repo: `git clone https://github.com/apache/couchdb-fauxton.git`
1. add upstream to the private apache repo: `git remote add upstream http://git-wip-us.apache.org/repos/asf/couchdb-fauxton.git`
1. go to your cloned copy of the repo (usually `couchdb-fauxton`) and type `npm install` to download all dependencies

## Running Fauxton

**NOTE: Before you run Fauxton, don't forget to start CouchDB!**


### The Dev Server

Using the dev server is the easiest way to use Fauxton, especially when developing for it. In the cloned repo folder,
type:

```
npm run dev
```

Wait until you see the "Fauxton" ascii art on your command line, then you should be able to access Fauxton at
`http://localhost:8000`


### Preparing a Fauxton Release

Follow the "Setting up Fauxton" section above, then edit the `settings.json` variable root where the document will live, 
e.g. `/_utils/`. Then type:

```
npm run couchdb
```
This will install the latest version of Fauxton into `/share/www/`


### To Deploy Fauxton

To deploy to your local [CouchDB instance](http://localhost:5984/fauxton/_design/fauxton/index.html):

    grunt couchapp_deploy

### Build pipeline overview

During a release build we are creating a folder called `dist/tmp-out`.
It contains all files that are just intermediate results for the final
release artifact. Once everything is finished the files are copied from
`tmp-out` to their final destination, `dist/release` where they are
part of the deployable release artifact.

### (Optional) To avoid a npm global install
    # Development mode, non minified files
    npm run couchdebug

    # Or fully compiled install
    npm run couchdb



## More information 

Check out the following pages for a lot more information about Fauxton:

- [The Fauxton Code Layout](https://github.com/apache/couchdb-fauxton/blob/master/code-layout.md)
- [Style Guide](https://github.com/apache/couchdb-fauxton/blob/master/styleguide.md)
- [Testing Fauxton](https://github.com/apache/couchdb-fauxton/blob/master/tests.md)
- [Writing Addons](https://github.com/apache/couchdb-fauxton/blob/master/writing_addons.md)
- [Extensions](https://github.com/apache/couchdb-fauxton/blob/master/extensions.md)
- [How to contribute](https://github.com/apache/couchdb-fauxton/blob/master/CONTRIBUTING.md)


------


-- The Fauxton Team

test pull request to test travis tests on master branch
