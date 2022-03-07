// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

const path = require("path");
const { URL } = require("url");

function loadCouchapp() {
  try {
    return require("couchapp");
  } catch (ex) {
    console.error("Missing dependency. Run 'npm install couchapp --no-save' and try again.");
  }
}

module.exports = function (grunt) {
  grunt.registerMultiTask("couchapp", "Install Couchapp", function () {
    // Loading 'couchapp' at runtime to avoid adding it to Fauxton's package.json
    // because 'npm audit' is reporting vulnerabilities against it, and the package is
    // no longer maintained.
    const couchapp = loadCouchapp();
    const done = this.async();
    const appobj = require(path.join(process.cwd(), path.normalize(this.data.app)));
    return couchapp.createApp(appobj, this.data.db, function (app) {
      return app.push(done);
    });
  });

  grunt.registerMultiTask("rmcouchdb", "Delete a Couch Database", function () {
    const _this = this;
    const done = this.async();
    const dbURL = new URL(this.data.db);
    const dbname = dbURL.pathname.replace(/^\//, "");
    try {
      const nano = require("nano")(dbURL.protocol + "//" + dbURL.host);
      nano.db.destroy(dbname, function (err) {
        if (err) {
          if (err.status_code && err.status_code === 404) {
            if (_this.data.options && _this.data.options.okay_if_missing) {
              grunt.log.writeln(
                "Database " + dbname + " not present... skipping."
              );
              return done(null, null);
            }
            grunt.warn("Database " + dbname + " does not exist.");

          } else {
            grunt.warn(err);
          }
        }
        return done(err, null);
      });
    } catch (e) {
      grunt.warn(e);
      done(e, null);
    }
  });

  grunt.registerMultiTask(
    "mkcouchdb",
    "Create a new Couch Database",
    function () {
      const _this = this;
      const done = this.async();
      const dbURL = new URL(this.data.db);
      const dbname = dbURL.pathname.replace(/^\//, "");
      try {
        const nano = require("nano")(dbURL.protocol + "//" + dbURL.host);
        nano.db.create(dbname, function (err) {
          if (_this.data.options && _this.data.options.okay_if_exists) {
            if (err) {
              grunt.log.writeln("Database " + dbname + " exists, skipping");
            }
            return done(null, null);
          }
          if (err) {
            grunt.warn(err);
          }
          return done(err, null);

        });
      } catch (e) {
        grunt.warn(e);
        done(e, null);
      }
    }
  );
};
