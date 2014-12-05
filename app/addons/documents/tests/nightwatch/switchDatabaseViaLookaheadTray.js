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
  'Confirm switching databases via lookahead tray': function (client) {
    var waitTime = 10000,
      newDatabaseName = client.globals.testDatabaseName,
      secondDatabaseName = newDatabaseName + "2",
      baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()

      // create the second database
      .createDatabase(secondDatabaseName)

      // now select the first database, and select the second db from the lookahead tray
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('#breadcrumbs .lookahead-tray-link', waitTime, false)
      .click('#breadcrumbs .lookahead-tray-link')
      .setValue('#breadcrumbs .search-autocomplete', [secondDatabaseName, client.Keys.ENTER])
      .getText('body', function (result) {

        // check the breadcrumb title is now the second database name. That indicates a successful redirect
        client.assert.containsText("#breadcrumbs .lookahead-tray-link", secondDatabaseName);
      })

      .deleteDatabase(secondDatabaseName)
      .end();
  }
};
