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
  'mango supports encoding': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = 'encoded/db-' + client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .deleteDatabase(newDatabaseName)
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + encodeURIComponent(newDatabaseName) + '/_all_docs')
      .waitForElementPresent('.bulk-action-component-panel', waitTime, true)
      .clickWhenVisible('#mango-query', waitTime, true)
      .waitForElementPresent('.mango-editor-wrapper', waitTime, true)
      .end();
  },

  'permissions supports encoding': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = 'encoded/db-' + client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .deleteDatabase(newDatabaseName)
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + encodeURIComponent(newDatabaseName) + '/_all_docs')
      .waitForElementPresent('.bulk-action-component-panel', waitTime, true)
      .clickWhenVisible('#permissions', waitTime, true)
      .waitForElementPresent('.permissions-page', waitTime, true)
      .end();
  },

  'changes supports encoding': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = 'encoded/db-' + client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .deleteDatabase(newDatabaseName)
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + encodeURIComponent(newDatabaseName) + '/_all_docs')
      .waitForElementPresent('.bulk-action-component-panel', waitTime, true)
      .clickWhenVisible('#changes', waitTime, true)
      .waitForElementPresent('.changes-header', waitTime, true)
      .end();
  }
};
