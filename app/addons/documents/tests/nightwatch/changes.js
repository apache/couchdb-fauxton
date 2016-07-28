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

  'Does not display the View-Selector-Button': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.two-sides-toggle-button', waitTime, false)
      .clickWhenVisible('#changes')
      .waitForElementPresent('.js-changes-view', waitTime, false)
      .assert.elementNotPresent('.two-sides-toggle-button')
      .end();
  },

  'Check doc link in Changes feed links properly': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .createDocument('doc_1', newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_changes')
      .waitForElementPresent('.change-box[data-id="doc_1"]', waitTime, false)

      // confirm only the single result is now listed in the page
      .clickWhenVisible('.js-doc-link')
      .waitForElementPresent('#doc-editor-actions-panel', waitTime, false)
      .end();
  }

};
