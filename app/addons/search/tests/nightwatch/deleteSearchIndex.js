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
  'Deletes a search index': function (client) {
    var newDatabaseName = client.globals.testDatabaseName,
        waitTime = client.globals.maxWaitTime,
        baseUrl = client.options.launch_url;

    client
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')

      // create a search index
      .waitForElementPresent('#new-design-docs-button', waitTime, false)
      .click('#new-design-docs-button a')
      .click('#new-design-docs-button a[href="#/database/' + newDatabaseName + '/new_search"]')
      .waitForElementVisible('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'test1')
      .clearValue('#search-name')
      .setValue('#search-name', 'test1-index')
      .clickWhenVisible('#save-index')
      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--success', waitTime, false)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.tableview-checkbox-cell', client.globals.maxWaitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, false)

      // confirm search index appears in sidebar
      .waitForElementVisible('#test1_test1-index', waitTime, true)

      // now delete it and confirm that the entire design doc gets removed (because it's the last index)
      .clickWhenVisible('.index-list li span', waitTime, true)
      .clickWhenVisible('.popover-content .fonticon-trash', waitTime, true)
      .clickWhenVisible('.confirmation-modal button.btn.btn-primary')

      // now wait for the sidebar to have removed the design doc
      .waitForElementNotPresent('#testdesigndoc', waitTime, true)
      .end();
  },

  'Deleting view when design doc has search index does not remove design doc': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      // this creates a view
      .populateDatabase(newDatabaseName)
      .loginToGUI()

      // now create a search index
      .url(baseUrl + '/#/database/' + newDatabaseName + '/new_search/testdesigndoc')
      .waitForElementVisible('#save-index', waitTime, false)
      .clearValue('#search-name')
      .setValue('#search-name', 'search-index1')
      .clickWhenVisible('#save-index')
      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--success', waitTime, false)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.tableview-checkbox-cell', client.globals.maxWaitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, false)

      // now delete the search index. Since there's a view in this design doc, the design doc should not be removed
      .clickWhenVisible('#nav-design-function-testdesigndocindexes .index-list li span', waitTime, true)
      .clickWhenVisible('.popover-content .fonticon-trash', waitTime, true)
      .waitForElementVisible('div.confirmation-modal', waitTime, false)
      .clickWhenVisible('.confirmation-modal button.btn.btn-primary')
      .waitForElementNotPresent('.confirmation-modal button.btn.btn-primary', waitTime, true)

      // just assert the search indexes section has been removed, but the design doc still exists
      .waitForElementNotPresent('#nav-design-function-testdesigndocindexes', waitTime, true)
      .waitForElementPresent('#design-doc-menu-testdesigndoc', waitTime, true)

      .end();
  }

};
