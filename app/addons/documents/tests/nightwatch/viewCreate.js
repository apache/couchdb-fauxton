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

  'Creates a Design Doc using the dropdown at "all documents"': function (client) {
    var waitTime = client.globals.maxWaitTime;
    var baseUrl = client.globals.test_settings.launch_url;

    /*jshint multistr: true */
    openDifferentDropdownsAndClick(client, '#header-dropdown-menu')
      .waitForElementPresent('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'test_design_doc-selenium-1')
      .clearValue('#index-name')
      .setValue('#index-name', 'hasenindex')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'hasehase\'); }");\
      ')
      .execute('$("#save-view")[0].scrollIntoView();')
      .waitForElementPresent('#save-view', waitTime, false)
      .clickWhenVisible('#save-view', waitTime, false)
      .checkForDocumentCreated('_design/test_design_doc-selenium-1')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .assert.containsText('.prettyprint', 'hasehase')
    .end();
  },

  'Creates a Design Doc and does not crash after navigating': function (client) {
    var waitTime = client.globals.maxWaitTime;
    var baseUrl = client.globals.test_settings.launch_url;

    /*jshint multistr: true */
    openDifferentDropdownsAndClick(client, '#header-dropdown-menu')
      .waitForElementPresent('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'test_design_doc-selenium-3')
      .clearValue('#index-name')
      .setValue('#index-name', 'hasenindex')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'hasehase\'); }");\
      ')
      .execute('$("#save-view")[0].scrollIntoView();')
      .waitForElementPresent('#save-view', waitTime, false)
      .clickWhenVisible('#save-view', waitTime, false)
      .checkForDocumentCreated('_design/test_design_doc-selenium-3')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, false)

      // page now automatically redirects user to results of View. Confirm the new doc is present.
      .assert.containsText('.prettyprint', 'hasehase')
    .end();
  },

  'Creates a Design Doc using the dropdown at "the upper dropdown in the header"': function (client) {
    var waitTime = client.globals.maxWaitTime;
    var baseUrl = client.globals.test_settings.launch_url;

    /*jshint multistr: true */
    openDifferentDropdownsAndClick(client, '#header-dropdown-menu')
      .waitForElementPresent('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'test_design_doc-selenium-2')
      .clearValue('#index-name')
      .setValue('#index-name', 'gaenseindex')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'gansgans\'); }");\
      ')
      .execute('$("#save-view")[0].scrollIntoView();')
      .waitForElementPresent('#save-view', waitTime, false)
      .clickWhenVisible('#save-view')
      .checkForDocumentCreated('_design/test_design_doc-selenium-2')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .assert.containsText('.prettyprint', 'gansgans')
    .end();
  },

  'Adds a View to a DDoc using an existing DDoc': function (client) {
    var waitTime = client.globals.maxWaitTime;
    var baseUrl = client.globals.test_settings.launch_url;
    var newDatabaseName = client.globals.testDatabaseName;
    /*jshint multistr: true */

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('#sidebar-tab-testdesigndoc a.dropdown-toggle.icon.fonticon-plus-circled', waitTime, false)
      .clickWhenVisible('#sidebar-tab-testdesigndoc a[href*="new_view"]', waitTime, false)
      .waitForElementVisible('#index-name', waitTime, false)
      .clearValue('#index-name')
      .setValue('#index-name', 'test-new-view')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'enteente\', 1); }");\
      ')
      .execute('$("#save-view")[0].scrollIntoView();')
      .clickWhenVisible('#save-view')
      .checkForDocumentCreated('_design/testdesigndoc/_view/test-new-view')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .assert.containsText('.prettyprint', 'enteente')
    .end();
  }
};

function openDifferentDropdownsAndClick (client, dropDownElement) {
  var modifier = dropDownElement.slice(1);
  var waitTime = client.globals.maxWaitTime;
  var newDatabaseName = client.globals.testDatabaseName;
  var baseUrl = client.globals.test_settings.launch_url;

  return client
    .loginToGUI()
    .populateDatabase(newDatabaseName)
    .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
    .waitForElementPresent(dropDownElement, waitTime, false)
    .waitForElementPresent(dropDownElement + ' a', waitTime, false)
    .clickWhenVisible(dropDownElement + ' a', waitTime, false)
    .waitForElementPresent(dropDownElement + ' a[href*="new_view"]', waitTime, false)
    .clickWhenVisible(dropDownElement + ' a[href*="new_view"]', waitTime, false)
    .waitForElementPresent('.index-cancel-link', waitTime, false);
}
