Fauxton for PouchDB Server
=======

This is a fork of [the main Fauxton project](https://github.com/apache/couchdb-fauxton) with modifications designed for PouchDB Server. Go there for the real repo and real documentation.

Configure
-------

Configuration is in the `settings.json` file.  You can use the default `settings.json.default` for reference.

The main HTML file can be modified at `./assets/index.underscore`. The footer was modified at `./app/addons/fauxton/templates/footer.html`. CSS was modified at `assets/less/fauxton.less`.

Images should be modified at `assets/img/pouchdb-minilogo.png` and `assets/img/pouchdb-site.png`.

Build
-----------

Build the HTML/CSS/JS:

    npm install
    grunt couchdb

Copy all files into express-pouchdb:

    cp -r dist/release/* /path/to/express-pouchdb/fauxton/

Then commit to the express-pouchdb project and you're done.
