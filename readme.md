![Build Status](https://github.com/apache/couchdb-fauxton/actions/workflows/main.yml/badge.svg?branch=main)

# Fauxton

Fauxton is the new Web UI for CouchDB. To get it running in development on your machine. Follow the steps below.

## Install as standalone server via npm

You can use the latest release of Fauxton via npm:

    npm install -g fauxton
    fauxton

See `fauxton --help` for extra options.


## Setting up Fauxton

Please note that [node.js](http://nodejs.org/) and npm is required. Specifically, Fauxton requires at least Node 6 and npm 3.

1. Fork this repo (see [GitHub help](https://help.github.com/articles/fork-a-repo/) for details)
1. Clone your fork: `git clone https://github.com/YOUR-USERNAME/couchdb-fauxton.git`
1. Go to your cloned copy: `cd couchdb-fauxton`
1. Set up the upstream repo: 
    * `git remote add upstream https://github.com/apache/couchdb-fauxton.git`
    * `git fetch upstream`
    * `git branch --set-upstream-to=upstream/main main`
1. Download all dependencies: `npm install`
1. Make sure you have CouchDB installed.
    - Option 1 (**recommended**): Use `npm run docker:up` to start a Docker container running CouchDB with user `tester` and password `testerpass`.
      - You need to have [Docker](https://docs.docker.com/engine/installation/) installed to use this option. 
    - Option 2: Follow instructions 
[found here](http://couchdb.readthedocs.org/en/latest/install/index.html)


## Running Fauxton

**NOTE: Before you run Fauxton, don't forget to start CouchDB!**


### The Dev Server

Using the dev server is the easiest way to use Fauxton, especially when developing for it. In the cloned repo folder,
type:

```
npm run dev
```

You should be able to access Fauxton at `http://localhost:8000`


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

- [The Fauxton Code Layout](https://github.com/apache/couchdb-fauxton/blob/main/code-layout.md)
- [Style Guide](https://github.com/apache/couchdb-fauxton/blob/main/styleguide.md)
- [Testing Fauxton](https://github.com/apache/couchdb-fauxton/blob/main/tests.md)
- [Extensions](https://github.com/apache/couchdb-fauxton/blob/main/extensions.md)
- [How to contribute](https://github.com/apache/couchdb-fauxton/blob/main/CONTRIBUTING.md)


------


-- The Fauxton Team
