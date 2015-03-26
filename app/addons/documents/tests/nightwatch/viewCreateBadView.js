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

  'Edits a design doc - set new index name': function (client) {
    /*jshint multistr: true */
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url,
        dropDownElement = '#header-dropdown-menu';

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent(dropDownElement, waitTime, false)
      .click(dropDownElement + ' a')
      .click(dropDownElement + ' a[href*="new_view"]')
      .waitForElementPresent('.editor-wrapper', waitTime, false)
      .setValue('#new-ddoc', 'test_design_doc-selenium-bad-reduce')
      .clearValue('#index-name')
      .setValue('#index-name', 'hasenindex')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'boom\', doc._id); }");\
      ')
      .click('#reduce-function-selector')
      .keys(['\uE013', '\uE013', '\uE013', '\uE013', '\uE006'])
      .click('button.btn-success.save')
      .waitForElementVisible('.alert-error', waitTime, false)
      .assert.containsText('.alert-error', 'builtin _sum function requires map values to be numbers or lists of numbers')
      .end();
  },

  'Visit url of broken view displays error': function (client) {
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/brokenview/_view/brokenview')
      .waitForElementVisible('.alert-error', waitTime, false)
      .assert.containsText('.alert-error', 'builtin _sum function requires map values to be numbers or lists of numbers')
      .end();
  }


};
