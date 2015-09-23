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
var helpers = require('../../../../../test/nightwatch_tests/helpers/helpers.js');
module.exports = {

  before: function (client, done) {
    var nano = helpers.getNanoInstance();
    nano.db.destroy(newDatabaseName, function (err, body, header) {
      done();
    });
  },

  after: function (client, done) {
    var nano = helpers.getNanoInstance();
    nano.db.destroy(newDatabaseName, function (err, body, header) {
      done();
    });
  },

  'Creates a Database' : function (client) {
    var waitTime = client.globals.maxWaitTime,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .checkForDatabaseDeleted(newDatabaseName, waitTime)
      .url(baseUrl)

      // ensure the page has fully loaded
      .waitForElementPresent('.databases.table', waitTime, false)
      .clickWhenVisible('.add-new-database-btn')
      .waitForElementVisible('#js-new-database-name', waitTime, false)
      .setValue('#js-new-database-name', [newDatabaseName])
      .clickWhenVisible('#js-create-database', waitTime, false)
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
  }
};
