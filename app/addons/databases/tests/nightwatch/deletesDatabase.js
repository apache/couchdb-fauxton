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
  'Deletes a database': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .createDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('#faux-header__doc-header-dropdown-toggle')
      .clickWhenVisible('div[aria-labelledby="faux-header__doc-header-dropdown-toggle"] .fonticon-trash')
      .waitForElementVisible('.delete-db-modal', waitTime, false)
      .clickWhenVisible('.delete-db-modal input[type="text"]', waitTime, false)
      .setValue('.delete-db-modal input[type="text"]', [newDatabaseName, client.Keys.ENTER])
      .checkForDatabaseDeleted(newDatabaseName, waitTime)
      .end();
  },

  'Deletes a database from the list': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .createDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/_all_dbs/')

      .waitForElementPresent('a[href="database/' + newDatabaseName + '/_all_docs"]', waitTime, false)
      .assert.elementPresent('a[href="database/' + newDatabaseName + '/_all_docs"]')

      .waitForElementPresent('button[aria-label="Delete ' + newDatabaseName + '"]', waitTime, false)
      .execute(`document.querySelector("button[aria-label='Delete ${newDatabaseName}']").scrollIntoView();`)
      .clickWhenVisible('button[aria-label="Delete ' + newDatabaseName + '"]', waitTime, false)

      .waitForElementVisible('.delete-db-modal', waitTime, false)
      .clickWhenVisible('.delete-db-modal input[type="text"]', waitTime, false)
      .setValue('.delete-db-modal input[type="text"]', [newDatabaseName, client.Keys.ENTER])
      .closeNotifications()
      .waitForElementPresent('.fauxton-table-list', waitTime, false)
      .checkForDatabaseDeleted(newDatabaseName, waitTime)
      .assert.not.elementPresent('a[href="database/' + newDatabaseName + '/_all_docs"]')

      .end();
  }
};
