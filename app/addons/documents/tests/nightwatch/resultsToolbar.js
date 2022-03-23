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
  'Defaults to metadata layout when displaying results': (client) => {
    const waitTime = client.globals.maxWaitTime;
    const newDatabaseName = client.globals.testDatabaseName;
    const baseUrl = client.options.launch_url;
    const newDocumentName = 'resultsToolbarTest';
    const docContent = {
      "foo": "bar"
    };

    client
      .createDocument(newDocumentName, newDatabaseName, docContent)
      .loginToGUI()
      .checkForDocumentCreated(newDocumentName)

      .url(`${baseUrl}#/database/${newDatabaseName}/_all_docs`)
      .waitForElementPresent('.two-sides-toggle-button', waitTime, false)
      .assert.textContains('.two-sides-toggle-button button.active', 'Metadata')
      .assert.not.elementPresent('.table-container-autocomplete')
      .end();
  },

  'Layouts update on manual url change/refresh and query options': (client) => {
    const waitTime = client.globals.maxWaitTime;
    const newDatabaseName = client.globals.testDatabaseName;
    const baseUrl = client.options.launch_url;
    const newDocumentName = 'resultsToolbarTest';
    const docContent = {
      "foo": "bar"
    };

    client
      .createDocument(newDocumentName, newDatabaseName, docContent)
      .loginToGUI()
      .checkForDocumentCreated(newDocumentName)
      .url(`${baseUrl}#/database/${newDatabaseName}/_all_docs`)
      .waitForElementPresent('.two-sides-toggle-button', waitTime, false)
      .assert.textContains('.two-sides-toggle-button button.active', 'Metadata')

      // turn include_docs on through query options
      .clickWhenVisible('.control-toggle-queryoptions')
      .waitForElementPresent('#qoIncludeDocsLabel', waitTime, false)
      .clickWhenVisible('#qoIncludeDocsLabel')
      .clickWhenVisible('.query-options .btn-secondary')
      .waitForElementPresent('.two-sides-toggle-button', waitTime, false)
      .assert.textContains('.two-sides-toggle-button button.active', 'Table')

      // switch to json view and then turn off include_docs
      .clickWhenVisible('.fonticon-json')
      .assert.textContains('.two-sides-toggle-button button.active', 'JSON')
      .clickWhenVisible('.control-toggle-queryoptions')
      .waitForElementPresent('#qoIncludeDocsLabel', waitTime, false)
      .assert.attributeEquals('#qoIncludeDocs', 'checked', 'true')
      .clickWhenVisible('#qoIncludeDocsLabel')
      .clickWhenVisible('.query-options .btn-secondary')
      .waitForElementPresent('.two-sides-toggle-button', waitTime, false)
      .assert.textContains('.two-sides-toggle-button button.active', 'Metadata')
      .end();
  },
};
