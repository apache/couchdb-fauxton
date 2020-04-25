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
  'Edit search without analyzer': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')

      // 1. Create a search index in a new design document
      .waitForElementPresent('#new-design-docs-button', waitTime, false)
      .click('#new-design-docs-button a')
      .click('#new-design-docs-button a[href="#/database/' + newDatabaseName + '/new_search"]')
      .waitForElementVisible('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'edit_search_wo_analyzer')
      .clearValue('#search-name')
      .setValue('#search-name', 'test1-index')
      .click('label[for="none-analyzer"]')
      .clickWhenVisible('#save-index')
      .waitForElementVisible('#global-notifications .alert.alert-success', client.globals.maxWaitTime, false)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.tableview-checkbox-cell', client.globals.maxWaitTime, false)
      .waitForElementNotPresent('.loading-lines', client.globals.maxWaitTime, false)

      // Make sure there's not analyzer field in the document JSON
      .clickWhenVisible('.fonticon-json')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementPresent('div[data-id="_design/edit_search_wo_analyzer"]', waitTime)
      .getText('div[data-id="_design/edit_search_wo_analyzer"]', function (result) {
        this.verify.ok(result.value.indexOf('"analyzer":') === -1, 'make sure no analyzer was saved');
      })

      // Now we edit that search index and make sure none is selected
      .click('#nav-design-function-edit_search_wo_analyzerindexes .fonticon-wrench2')
      .waitForElementPresent('#index-menu-component-popover', waitTime)
      .click('#index-menu-component-popover .fonticon-file-code-o')
      .waitForElementVisible('#search-name', waitTime, false)
      .assert.attributeContains('#none-analyzer', 'checked', true)
      .end();
  },
};
