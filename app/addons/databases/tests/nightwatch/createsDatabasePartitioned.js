
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



var newDatabaseName = 'fauxton-selenium-tests-db-create';
var invalidDatabaseName = 'fauxton-selenium-tests-#####';
var helpers = require('../../../../../test/nightwatch_tests/helpers/helpers.js');
module.exports = {
  '@tags': ['partitioned'],

  before: function (client, done) {
    const nano = helpers.getNanoInstance(client.options.db_url);
    nano.db.destroy(newDatabaseName).then(() => {
      done();
    }).catch(()  => {
      done();
    });
  },

  after: function (client, done) {
    const nano = helpers.getNanoInstance(client.options.db_url);
    nano.db.destroy(newDatabaseName).then(() => {
      done();
    }).catch(()  => {
      console.warn(`Could not delete ${newDatabaseName} db`);
      done();
    });
  },

  'Creates a Database' : function (client) {
    var waitTime = client.globals.maxWaitTime,
        baseUrl = client.options.launch_url;

    client
      .loginToGUI()
      .checkForDatabaseDeleted(newDatabaseName, waitTime)
      .url(baseUrl)

      // ensure the page has fully loaded
      .waitForElementPresent('.databases.table', waitTime, false)
      .clickWhenVisible('.add-new-database-btn')
      .waitForElementVisible('#js-new-database-name', waitTime, false)
      .setValue('#js-new-database-name', [newDatabaseName])
      .clickWhenVisible('#partitioned-option', waitTime, false)
      .clickWhenVisible('#js-create-database', waitTime, false)
      .waitForElementNotPresent('.new-database-tray', waitTime, false)
      .checkForDatabaseCreated(newDatabaseName, waitTime)
      .url(baseUrl + '/_all_dbs')
      .waitForElementVisible('html', waitTime, false)
      .getText('html', function (result) {
        var data = result.value,
            createdDatabaseIsPresent = data.indexOf(newDatabaseName);

        this.verify.ok(createdDatabaseIsPresent > 0,
          'Checking if new database shows up in _all_dbs.');
      })
      .end();
  },

  'Creates a Database with invalid name' : function (client) {
    var waitTime = client.globals.maxWaitTime,
        baseUrl = client.options.launch_url;

    client
      .loginToGUI()
      .checkForDatabaseDeleted(invalidDatabaseName, waitTime)
      .url(baseUrl)

    // ensure the page has fully loaded
      .waitForElementPresent('.databases.table', waitTime, false)
      .clickWhenVisible('.add-new-database-btn')
      .waitForElementVisible('#js-new-database-name', waitTime, false)
      .setValue('#js-new-database-name', [invalidDatabaseName])
      .clickWhenVisible('#partitioned-option', waitTime, false)
      .clickWhenVisible('#js-create-database', waitTime, false)
      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--error', waitTime, false)
      .url(baseUrl + '/_all_dbs')
      .waitForElementVisible('html', waitTime, false)
      .getText('html', function (result) {
        var data = result.value,
            createdDatabaseIsPresent = data.indexOf(invalidDatabaseName);

        this.verify.ok(createdDatabaseIsPresent === -1,
          'Checking if new database shows up in _all_dbs.');
      })
      .end();
  }
};

