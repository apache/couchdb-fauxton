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

  'Displays an error if reduce is not possible': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url,
        dropDownElement = '#header-dropdown-menu';

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent(dropDownElement, waitTime, false)
      .clickWhenVisible(dropDownElement + ' a')
      .clickWhenVisible(dropDownElement + ' a[href*="new_view"]')
      .waitForElementVisible('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'test_design_doc-selenium-bad-reduce')
      .clearValue('#index-name')
      .setValue('#index-name', 'hasenindex')
      .clickWhenVisible('#reduce-function-selector')
      .keys(['\uE013', '\uE013', '\uE013', '\uE013', '\uE006'])
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'boom\', doc._id); }");\
      ')
      .execute('$(".save")[0].scrollIntoView();')
      .clickWhenVisible('button.btn-success.save')
      .waitForAttribute('#global-notifications', 'textContent', function (docContents) {
        return (/_sum function requires/).test(docContents);
      })
      .end();
  },

  'Visit url of broken view displays error': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/brokenview/_view/brokenview')
      .waitForAttribute('#global-notifications', 'textContent', function (docContents) {
        return (/_sum function requires/).test(docContents);
      })
      .end();
  }


};
