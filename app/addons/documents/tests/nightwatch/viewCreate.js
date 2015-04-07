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

var waitTime,
    baseUrl,
    newDatabaseName,
    newDocumentName,
    modifier;

var tests = {

  'Creates a Design Doc using the dropdown at "all documents"': function (client) {
    var waitTime = client.globals.maxWaitTime;

    /*jshint multistr: true */
    openDifferentDropdownsAndClick(client, '#header-dropdown-menu')
      .setValue('#new-ddoc', 'test_design_doc-selenium-1')
      .clearValue('#index-name')
      .setValue('#index-name', 'hasenindex')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'hasehase\'); }");\
      ')
      .execute('$(".save")[0].scrollIntoView();')
      .click('button.btn.btn-success.save')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .assert.containsText('.prettyprint', 'hasehase')
    .end();
  },


  'Creates a Design Doc using the dropdown at "the upper dropdown in the header"': function (client) {
    var waitTime = client.globals.maxWaitTime;

    /*jshint multistr: true */
    openDifferentDropdownsAndClick(client, '#header-dropdown-menu')
      .setValue('#new-ddoc', 'test_design_doc-selenium-2')
      .clearValue('#index-name')
      .setValue('#index-name', 'gaenseindex')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'gansgans\'); }");\
      ')
      .execute('$(".save")[0].scrollIntoView();')
      .click('button.btn-success.save')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .assert.containsText('.prettyprint', 'gansgans')
    .end();
  },

  'Adds a View to a DDoc using an existing DDoc': function (client) {
    var waitTime = client.globals.maxWaitTime;
    /*jshint multistr: true */

    openDifferentDropdownsAndClick(client, '[data-target="#testdesigndoc"]')
      .clearValue('#index-name')
      .setValue('#index-name', 'test-new-view')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'enteente\', 1); }");\
      ')
      .execute('$(".save")[0].scrollIntoView();')
      .click('button.btn-success.save')
      .waitForAttribute('#global-notifications', 'textContent', function (notification) {
        return (/View Saved./).test(notification.trim());
      })
      //go back to all docs
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('[data-target="#testdesigndoc"]', waitTime, false)
      .clickWhenVisible('[data-target="#testdesigndocviews"]', waitTime, false)
      .clickWhenVisible('#testdesigndoc_testnewview', waitTime, false)
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .assert.containsText('.prettyprint', 'enteente')
    .end();
  }
};

function openDifferentDropdownsAndClick (client, dropDownElement) {
  modifier = dropDownElement.slice(1);
  waitTime = client.globals.maxWaitTime;
  newDatabaseName = client.globals.testDatabaseName;
  newDocumentName = 'create_view_doc' + modifier;
  baseUrl = client.globals.test_settings.launch_url;

  return client
    .loginToGUI()
    .populateDatabase(newDatabaseName)
    .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
    .waitForElementPresent(dropDownElement, waitTime, false)
    .click(dropDownElement + ' a')
    .click(dropDownElement + ' a[href*="new_view"]')
    .waitForElementPresent('.editor-wrapper', waitTime, false);
}

module.exports = tests;
