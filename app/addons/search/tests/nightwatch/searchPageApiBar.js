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
  'Check API Bar is present/hidden on appropriate page and is encoded': function (client) {
    const newDatabaseName = client.globals.testDatabaseName,
          baseUrl = client.options.launch_url;

    const searchStr = "class:bird";
    const searchStrEncoded = encodeURIComponent(searchStr);
    const fullURL = baseUrl + '/' + newDatabaseName + '/_design/keyview/_search/api-bar-test?q=' + searchStrEncoded;

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')

      // start creating a search index in _design/keyview design doc
      .waitForElementPresent('#new-design-docs-button', client.globals.maxWaitTime, false)
      .click('#new-design-docs-button a')
      .click('#new-design-docs-button a[href="#/database/' + newDatabaseName + '/new_search"]')
      .clickWhenVisible('.styled-select select')

      // confirm there's no API URL field on the create index page
      .pause(5000)
      .assert.not.elementPresent('.faux__jsonlink')

      // now create the rest of the index
      .keys(['_design/keyview', '\uE006'])
      .clearValue('#search-name')
      .setValue('#search-name', 'api-bar-test')
      .clickWhenVisible('#save-index')
      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--success', client.globals.maxWaitTime, false)

      // confirm the API URL field now shows up (we're on the edit search index page now)
      .assert.elementPresent('.faux__jsonlink')

      // now enter a search and confirm it's properly encoded in the api URL bar
      .setValue('#search-index-preview-form input', searchStr)
      .clickWhenVisible('#search-index-preview-form button')

      .waitForElementNotVisible('.Toastify__toast-container .Toastify__toast--success', client.globals.maxWaitTime, false)
      .waitForElementNotPresent('.loading-lines', client.globals.maxWaitTime, false)
      .assert.attributeContains('.faux__jsonlink-link', 'href', fullURL)
      .end();
  }
};
