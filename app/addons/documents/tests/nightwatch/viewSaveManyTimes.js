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

  'View can be saved multiple times': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
    newDatabaseName = client.globals.testDatabaseName,
    dropDownElement = '#header-dropdown-menu',
    baseUrl = client.globals.test_settings.launch_url;

    client
    .loginToGUI()
    .populateDatabase(newDatabaseName)
    .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
    .waitForElementPresent(dropDownElement, waitTime, false)
    .click(dropDownElement + ' a')
    .click(dropDownElement + ' a[href*="new_view"]')
    .waitForElementPresent('.editor-wrapper', waitTime, false)
    .setValue('#new-ddoc', 'test_design_doc-save-many-times')
    .clearValue('#index-name')
    .setValue('#index-name', 'multiple-saves')
    .execute('\
      var editor = ace.edit("map-function");\
      editor.getSession().setValue("function (doc) { emit(\'boom\', doc._id); }");\
    ')
    .click('button.btn-success.save')
    .waitForElementVisible('.alert-success', waitTime, false)
    .waitForElementNotVisible('.alert-success', waitTime, false)
    .click('button.btn-success.save')
    .waitForElementVisible('.alert-success', waitTime, false)
    .waitForElementNotVisible('.alert-success', waitTime, false)
    .click('button.btn-success.save')
    .assert.containsText('.alert-success', 'View Saved.')
    .end();
  },
};
