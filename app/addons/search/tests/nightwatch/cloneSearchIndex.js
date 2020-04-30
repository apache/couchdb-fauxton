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
  'Clones a search index': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .createDatabase(newDatabaseName)
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

      .clickWhenVisible('.index-list li span', waitTime, true)
      .clickWhenVisible('.popover-content .fonticon-files-o', waitTime, true)
      .waitForElementVisible('#new-index-name', waitTime, true)
      .setValue('#new-index-name', 'cloned-search-index')
      .clickWhenVisible('.clone-index-modal .btn-primary', waitTime, true)

      // now wait for the sidebar to be updated with the new view
      .waitForElementVisible('#test1_cloned-search-index', waitTime, true)
      .end();
  }
};
