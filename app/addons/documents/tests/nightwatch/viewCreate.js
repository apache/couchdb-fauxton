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

  'creates design docs with js hint errors': function (client) {
    const waitTime = client.globals.maxWaitTime;

    /*jshint multistr: true */
    openDifferentDropdownsAndClick(client)
      .waitForElementPresent('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'test_design_doc-selenium-0')
      .clearValue('#index-name')
      .setValue('#index-name', 'furbie')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { if (doc != \'\') { emit(\'blerg\'); } else { emit(\'nana\'); }  }");\
      ')
      .clickWhenVisible('#save-view', waitTime)
      .checkForDocumentCreated('_design/test_design_doc-selenium-0')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementPresent('.table-view-docs', waitTime, false)
      .assert.textContains('td[title="blerg"]', 'blerg')
      .end();
  },

  'Creates a Design Doc using the dropdown at "all documents"': function (client) {
    var waitTime = client.globals.maxWaitTime;

    /*jshint multistr: true */
    openDifferentDropdownsAndClick(client)
      .waitForElementPresent('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'test_design_doc-selenium-1')
      .clearValue('#index-name')
      .setValue('#index-name', 'hasenindex')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'hasehase\'); }");\
      ')
      .clickWhenVisible('#save-view', waitTime)
      .checkForDocumentCreated('_design/test_design_doc-selenium-1')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementPresent('.table-view-docs', waitTime, false)
      .assert.textContains('td[title="hasehase"]', 'hasehase')
      .end();
  },

  'Creates a Design Doc and does not crash after navigating': function (client) {
    var waitTime = client.globals.maxWaitTime;

    /*jshint multistr: true */
    openDifferentDropdownsAndClick(client)
      .waitForElementPresent('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'test_design_doc-selenium-3')
      .clearValue('#index-name')
      .setValue('#index-name', 'hasenindex')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'hasehase\'); }");\
      ')
      .clickWhenVisible('#save-view', waitTime)
      .checkForDocumentCreated('_design/test_design_doc-selenium-3')
      .waitForElementNotPresent('.loading-lines', waitTime, false)

      // page now automatically redirects user to results of View. Confirm the new doc is present.
      .waitForElementPresent('.table-view-docs', waitTime, false)
      .assert.textContains('td[title="hasehase"]', 'hasehase')
      .end();
  },

  'Creates a Design Doc using the dropdown at "the upper dropdown in the header"': function (client) {
    var waitTime = client.globals.maxWaitTime;

    /*jshint multistr: true */
    openDifferentDropdownsAndClick(client)
      .waitForElementPresent('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'test_design_doc-selenium-2')
      .clearValue('#index-name')
      .setValue('#index-name', 'gaenseindex')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'gansgans\'); }");\
      ')
      .clickWhenVisible('#save-view')
      .checkForDocumentCreated('_design/test_design_doc-selenium-2')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementPresent('.table-view-docs', waitTime, false)
      .assert.textContains('td[title="gansgans"]', 'gansgans')
      .end();
  },

  'Adds a View to a DDoc using an existing DDoc': function (client) {
    var waitTime = client.globals.maxWaitTime;
    var baseUrl = client.options.launch_url;
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
      .clickWhenVisible('#save-view')
      .checkForDocumentCreated('_design/testdesigndoc/_view/test-new-view')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementPresent('.table-view-docs', waitTime, false)
      .assert.textContains('td[title="enteente"]', 'enteente')
      .end();
  }
};

function openDifferentDropdownsAndClick (client) {
  var waitTime = client.globals.maxWaitTime;
  var newDatabaseName = client.globals.testDatabaseName;
  var baseUrl = client.options.launch_url;

  return client
    .loginToGUI()
    .populateDatabase(newDatabaseName)
    .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
    .clickWhenVisible('.faux-header__doc-header-dropdown-toggle')
    .clickWhenVisible('.faux-header__doc-header-dropdown-itemwrapper a[href*="new_view"]')
    .waitForElementPresent('.index-cancel-link', waitTime, false);
}
