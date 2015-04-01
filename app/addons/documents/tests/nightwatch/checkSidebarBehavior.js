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

  'Checks if design docs that have a dot symbol in the id show up in the UI': function (client) {
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .createDocument('_design/ddoc_normal', newDatabaseName)
      .createDocument('_design/ddoc.with.specialcharacters', newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.nav-list', waitTime, false)
      .assert.hidden('a[href="#/database/' + newDatabaseName + '/_design/ddoc_normal/_info"]')
      .assert.hidden('a[href="#/database/' + newDatabaseName + '/_design/ddoc.with.specialcharacters/_info"]')

      .clickWhenVisible('#nav-header-ddoc_normal')
      .assert.visible('a[href="#/database/' + newDatabaseName + '/_design/ddoc_normal/_info"]')
      .clickWhenVisible('[title="_design/ddoc.with.specialcharacters"]')
      .assert.visible('a[href="#/database/' + newDatabaseName + '/_design/ddoc.with.specialcharacters/_info"]')
    .end();
  }
};
