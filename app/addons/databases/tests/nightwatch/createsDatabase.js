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

module.exports = {
  'Creates a Database' : function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .deleteDatabase(newDatabaseName) //need to delete the automatic database 'fauxton-selenium-tests' that has been set up before each test
      .url(baseUrl)

      // ensure the page has fully loaded
      .waitForElementPresent('.databases.table', waitTime, false)
      .waitForElementPresent('#add-new-database', waitTime, false)
      .clickWhenVisible('#add-new-database', waitTime, false)
      .waitForElementVisible('#js-new-database-name', waitTime, false)
      .setValue('#js-new-database-name', [newDatabaseName])
      .clickWhenVisible('#js-create-database', waitTime, false)
      .waitForAttribute('#global-notifications', 'textContent', function (successAlertText) {
        return (/Database created successfully/).test(successAlertText);
      })
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
