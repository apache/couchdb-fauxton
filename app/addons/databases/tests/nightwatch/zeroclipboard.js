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
  'ZeroClipboard copies' : function (client) {
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .deleteDatabase(newDatabaseName) //need to delete the automatic database 'fauxton-selenium-tests' that has been set up before each test
      .url(baseUrl)

      .waitForElementPresent('.api-url-btn', waitTime, false)
      .click('.api-url-btn')
      .waitForElementVisible('.copy-url', waitTime, false)
      .moveTo('.copy-url')
      .click('.copy-url')
      .mouseButtonDown('left')
      .mouseButtonUp('left')
      .closeNotification()
      .setValue('.search-autocomplete', '')
      .keys([client.Keys.COMMAND, 'v'])
      .assert.value('.search-autocomplete', 'http://localhost:8000/_all_dbs')

    .end();
  }
};
