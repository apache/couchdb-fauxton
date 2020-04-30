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


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const dbName = 'fauxton-selenium-tests-' + getRandomInt(1, 20000);

function createDatabase(nano, database) {
  return nano.db.create(database).catch(err => {
    //Tolerate database already existing
    if (err && err.statusCode !== 412) {
      throw err;
    }
  });
}

module.exports = {
  asyncHookTimeout: 20000,
  maxWaitTime: 30000,
  testDatabaseName: dbName,

  getNanoInstance: function (dbURL) {
    console.log('DBURL:', dbURL);
    return nano(dbURL);
  },

  beforeEach: function (browser, done) {
    var nano = module.exports.getNanoInstance(browser.options.db_url),
      database = module.exports.testDatabaseName;

    console.log('nano setting up database', database);
    // clean up the database we created previously
    nano.db.destroy(database).catch(err => {
      if (err && err.message !== 'Database does not exist.' && err.message !== 'missing') {
        console.log('Error in setting up ' + database, err.message);
      }
    }).then(() => {
      // create a new database
      nano.db.create(database).catch(err => {
        console.log('Error in setting up ' + database, err.message);
      }).then(() => {
        // Create required dbs
        const databaseToCreate = ["_users", "_replicator", "_global_changes"];
        const promises = databaseToCreate.map(db => createDatabase(nano, db).catch(() => {}));

        Promise.all(promises).then(function () {
          done();
        }).catch(function (err) {
          console.log("Unable to create required databases:" + JSON.stringify(err));
          done();
        });
      });
    });
  },

  afterEach: function (browser, done) {
    // Delete test database
    var nano = module.exports.getNanoInstance(browser.options.db_url),
      database = module.exports.testDatabaseName;

    console.log('nano cleaning up', database);
    var destroyDbProm = nano.db.destroy(database).catch(err => {
      if (err && err.message !== 'Database does not exist.') {
        console.warn('Error in cleaning up ' + database, err.message);
      }
    });

    // Prints the browser's console logs in case it's a failure
    var promGetLog = Promise.resolve();
    if (browser && browser.sessionId && browser.currentTest && browser.currentTest.results) {
      var res = browser.currentTest.results;
      if (res.errors > 0 || res.failed > 0) {
        promGetLog = new Promise((resolve, reject) => {
          try {
            browser.getLog('browser', (logEntriesArray) => {
              // !! IMPORTANT: Ends the session since the Nightwatch settings have "end_session_on_fail: false"
              try {
                browser.end();
              } catch (e) {}
              resolve(logEntriesArray);
            });
          } catch (err) {
            reject(err);
          }
        }).catch(err => {
          console.warn('Failed to fetch browser logs', err);
        }).then(logEntriesArray => {
          if (logEntriesArray) {
            console.warn('Browser logs for failed test:');
            logEntriesArray.forEach(function(log) {
              console.warn('   [' + log.level + '] ' + ' : ' + log.message);
            });
          }
        });
      }
    }

    Promise.all([promGetLog, destroyDbProm]).then(() => {
      done();
    });
  }
};
