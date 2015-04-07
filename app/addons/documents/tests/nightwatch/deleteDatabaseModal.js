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
  'Shows a warning for system databases (prefixed with _)': function (client) {
    var waitTime = client.globals.maxWaitTime,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .url(baseUrl + '/#/database/_replicator/_all_docs')
      .waitForElementPresent('#header-dropdown-menu a.dropdown-toggle.icon.fonticon-cog', waitTime, false)
      .click("#header-dropdown-menu a.dropdown-toggle.icon.fonticon-cog")
      .waitForElementPresent('#header-dropdown-menu .fonticon-trash', waitTime, false)
      .click('#header-dropdown-menu .fonticon-trash')
      .waitForElementVisible('#db_name', waitTime, false)
      .assert.elementPresent('.warning')
    .end();
  },

  'Shows no warning for non system databases': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('#header-dropdown-menu a.dropdown-toggle.icon.fonticon-cog', waitTime, false)
      .click("#header-dropdown-menu a.dropdown-toggle.icon.fonticon-cog")
      .waitForElementPresent('#header-dropdown-menu .fonticon-trash', waitTime, false)
      .click('#header-dropdown-menu .fonticon-trash')
      .waitForElementVisible('#db_name', waitTime, false)
      .assert.elementNotPresent('.warning')
    .end();
  }
};
