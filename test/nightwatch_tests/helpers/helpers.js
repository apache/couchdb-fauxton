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

var nano = require('nano');
var async = require('async');

module.exports = {
  maxWaitTime: 30000,
  testDatabaseName : 'fauxton-selenium-tests',
  cookies: {},
  auth: '0',

  initNanoInstance: function () {
    this.nano = nano(this.test_settings.db_url),
        user = this.test_settings.fauxton_username,
        pass = this.test_settings.password;

    module.exports.nano.auth(user, pass, function (err, body, headers) {
      console.log("err", err);
      console.log("body", body);
      console.log("headers", headers);

      if (err) return console.log(err);

      if (headers && headers['set-cookie']) {
        module.exports.cookies[user] = headers['set-cookie'];
      }

      console.log("Auth worked!");
    });
  },

  reuseNanoCookie: function (callback) {
    var auth = module.exports.cookies[this.test_settings.fauxton_username];
    module.exports.nano = nano({
      url: this.test_settings.db_url,
      cookies: 'AuthSession=' + auth
    });

    callback(done);
  },

  beforeEach: function (done) {
    console.log("nano setting up database");
    // clean up the database we created previously
    
    module.exports.initNanoInstance();
    module.exports.reuseNanoCookie(beforeEachTest);

    function beforeEachTest () {

      var database = module.exports.testDatabaseName;
      module.exports.nano.db.destroy(database, function (err, body, headers) {
        if (err && err.message !== 'Database does not exist.' && err.message !== 'missing') {
          console.log('Error in setting up ' + database, err.message);
        }

        // change the cookie if couchdb tells us to
        if (headers && headers['set-cookie']) {
          module.exports.auth = headers['set-cookie'];
        }

        // create a new database
        module.exports.nano.db.create(database, function (err, body, header) {
          if (err) {
            console.log('Error in setting up ' + database, err.message);
          }

          // change the cookie if couchdb tells us to
          if (headers && headers['set-cookie']) {
            module.exports.auth = headers['set-cookie'];
          }

          done();
        });
      });
    }
  },

  afterEach: function (done) {
    var nano = module.exports.getNanoInstance(),
        database = module.exports.testDatabaseName;

    console.log('nano cleaning up');
    nano.db.destroy(database, function (err, header, body) {
      if (err) {
        console.log('Error in cleaning up ' + database, err.message);
      }
      done();
    });
  }
};
