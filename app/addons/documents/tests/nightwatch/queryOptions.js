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

  'Query Options: check startkey filters properly': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName, 3)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .clickWhenVisible('.control-toggle-queryoptions')
      .clickWhenVisible('#betweenKeys', waitTime, false)
      .setValue('#startkey', '"document_2"')
      .clickWhenVisible('.query-options .btn-secondary')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .clickWhenVisible('.fonticon-json')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementNotPresent('#doc-list [data-id="document_1"]', waitTime, false)
      .waitForElementPresent('#doc-list [data-id="document_2"]', waitTime, false)
      .assert.elementPresent('#doc-list [data-id="document_2"]')
      .waitForElementPresent('#doc-list [data-id="document_3"]', waitTime, false)
      .assert.elementPresent('#doc-list [data-id="document_3"]')
    .end();
  }
};
