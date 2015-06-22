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
  'Edit view: Queryoptions work': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName, 3)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/keyview/_view/keyview')
      .clickWhenVisible('#toggle-query', waitTime, false)
      .clickWhenVisible('#byKeys', waitTime, false)
      .setValue('#keys-input', '["document_1"]')
      .clickWhenVisible('#query-options .btn-success')
      .waitForElementNotPresent('#right-content [data-id="document_2"]', waitTime, false)
      .assert.elementNotPresent('#right-content [data-id="document_2"]')
      .assert.elementNotPresent('#right-content [data-id="document_0"]')
      .assert.elementPresent('#right-content [data-id="document_1"]')
    .end();
  }
};
