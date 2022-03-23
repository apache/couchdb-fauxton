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
    const waitTime = client.globals.maxWaitTime,
          newDatabaseName = client.globals.testDatabaseName,
          baseUrl = client.options.launch_url;

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('.faux-header__doc-header-dropdown-toggle')
      .clickWhenVisible('.faux-header__doc-header-dropdown-itemwrapper a[href*="new_view"]')
      .waitForElementVisible('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'test_design_doc-selenium-bad-reduce')
      .clearValue('#index-name')
      .setValue('#index-name', 'hasenindex')
      .clickWhenVisible('select[id="reduce-function-selector"] option[value="_sum"]')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'boom\', doc._id); }");\
      ')
      .clickWhenVisible('#save-view')
      .closeNotifications()
      .clickWhenVisible('.control-toggle-queryoptions', waitTime, false)
      .clickWhenVisible('label[for="qoReduce"]', waitTime, false)
      .clickWhenVisible('.query-options .btn-secondary', waitTime, false)
      .waitForElementVisible('div.table-view-docs', waitTime, false)
      .waitForAttribute('.table-view-docs td:nth-child(4)', 'title', function (docContents) {
        return (/_sum function requires/).test(docContents);
      })
      .end();
  },

  'Visit url of broken view displays error': function (client) {
    const newDatabaseName = client.globals.testDatabaseName,
          baseUrl = client.options.launch_url,
          waitTime = client.globals.maxWaitTime;

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/brokenview/_view/brokenview')
      .clickWhenVisible('.control-toggle-queryoptions', waitTime, false)
      .clickWhenVisible('label[for="qoReduce"]', waitTime, false)
      .clickWhenVisible('.query-options .btn-secondary', waitTime, false)
      .waitForElementVisible('div.table-view-docs', waitTime, false)
      .waitForAttribute('.table-view-docs td:nth-child(4)', 'title', function (docContents) {
        return (/_sum function requires/).test(docContents);
      })
      .end();
  }


};
