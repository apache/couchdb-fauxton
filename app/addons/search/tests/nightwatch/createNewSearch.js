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
  '@tags': ['search'],
  'Creates new Search index for Dash': function (client) {
    /*jshint multistr: true */

    var newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    var searchFunctionString = function (append) {
      return 'function (doc) {'                  +
        'index("name", doc.name ' + append + ');' +
        '}';
    };

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('#new-design-docs-button', client.globals.maxWaitTime, false)
      .click('#new-design-docs-button a')
      .click('#new-design-docs-button a[href="#/database/' + newDatabaseName + '/new_search"]')
      .waitForElementVisible('.faux-header__doc-header-title', client.globals.maxWaitTime, true)

      .clickWhenVisible('.styled-select select')
      .keys(['_design/keyview', '\uE006'])

      .clearValue('#search-name')
      .setValue('#search-name', 'fancy_search')
      .execute('\
        var editor = ace.edit("search-function");\
        editor.getSession().setValue("' + searchFunctionString(0) + '");\
      ')

      .clickWhenVisible('#save-index')
      .waitForElementPresent('#keyview_fancy_search', client.globals.maxWaitTime, false)
      .end();
  },

  'Creating a new index has a clean slate': function (client) {
    var newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')

      // 1. create a search index in _design/keyview design doc
      .waitForElementPresent('#new-design-docs-button', client.globals.maxWaitTime, false)
      .click('#new-design-docs-button a')
      .click('#new-design-docs-button a[href="#/database/' + newDatabaseName + '/new_search"]')
      .clickWhenVisible('.styled-select select')
      .keys(['_design/keyview', '\uE006'])

      .clearValue('#search-name')
      .setValue('#search-name', 'clean-slate-test')
      .clickWhenVisible('#save-index')
      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--success', client.globals.maxWaitTime, false)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.tableview-checkbox-cell', client.globals.maxWaitTime, false)
      .waitForElementNotPresent('.loading-lines', client.globals.maxWaitTime, false)

      // 2. create a new search index. The "Save to design doc" dropdown should default to New Document
      .waitForElementPresent('#new-design-docs-button', client.globals.maxWaitTime, false)
      .click('#new-design-docs-button a')
      .click('#new-design-docs-button a[href="#/database/' + newDatabaseName + '/new_search"]')
      .waitForElementVisible('.styled-select select', client.globals.maxWaitTime, false)
      .assert.value('.styled-select select', 'new-doc')
      .end();
  },

  'Adding two indexes in a row does not add multiple indexes': function (client) {
    var newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .loginToGUI()
      .createDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')

      // 1. create a search index in _design/test1
      .waitForElementPresent('#new-design-docs-button', client.globals.maxWaitTime, false)
      .click('#new-design-docs-button a')
      .click('#new-design-docs-button a[href="#/database/' + newDatabaseName + '/new_search"]')
      .waitForElementVisible('#new-ddoc', client.globals.maxWaitTime, false)
      .setValue('#new-ddoc', 'test1')
      .clearValue('#search-name')
      .setValue('#search-name', 'test1-index')
      .clickWhenVisible('#save-index')
      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--success', client.globals.maxWaitTime, false)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.tableview-checkbox-cell', client.globals.maxWaitTime, false)
      .waitForElementNotPresent('.loading-lines', client.globals.maxWaitTime, false)

      // 2. create a second index in _design/test2
      .waitForElementPresent('#new-design-docs-button', client.globals.maxWaitTime, false)
      .click('#new-design-docs-button a')
      .click('#new-design-docs-button a[href="#/database/' + newDatabaseName + '/new_search"]')
      .waitForElementVisible('#new-ddoc', client.globals.maxWaitTime, false)
      .setValue('#new-ddoc', 'test2')
      .clearValue('#search-name')
      .setValue('#search-name', 'test2-index')
      .clickWhenVisible('#save-index')

      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--success', client.globals.maxWaitTime, false)

      // 3. confirm that the nav bar shows ONLY one search index each:
      //  _design/test1 has the single _design/test1-index
      //  _design/test2 has the single _design/test2-index
      .waitForElementPresent('#test1_test1-index', client.globals.maxWaitTime, false)
      .waitForElementNotPresent('#test1_test2-index', client.globals.maxWaitTime, false)
      .waitForElementNotPresent('#test2_test1-index', client.globals.maxWaitTime, false)
      .waitForElementPresent('#test2_test2-index', client.globals.maxWaitTime, false)

      .end();
  }
};
