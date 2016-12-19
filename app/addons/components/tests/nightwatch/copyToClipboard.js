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

  // Since we can't directly access the clipboard to verify, we'll confirm that
  // the text to copy is correct and the successful callback is displayed.

  'Copy API URL to Clipboard Test' : (client) => {

    const waitTime = client.globals.maxWaitTime;
    const baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .url(baseUrl + '/#/_all_dbs')

      .clickWhenVisible('.control-toggle-api-url', waitTime, false)
      .waitForElementVisible('.text-field-to-copy', waitTime, false)
      .assert.attributeEquals('.text-field-to-copy', 'value', baseUrl + '/_all_dbs')
      .waitForElementVisible('.copy-button', waitTime, false)
      .assert.attributeEquals('.copy-button', 'data-clipboard-text', baseUrl + '/_all_dbs')
      .click('.copy-button')
      .waitForElementVisible('.global-notification', waitTime, false)
      .assert.containsText('.global-notification > span', 'The API URL has been copied to the clipboard.')
    .end();
  },

  'Copy MD5 Checksum to Clipboard Test' : (client) => {

    const waitTime = client.globals.maxWaitTime;
    const newDatabaseName = client.globals.testDatabaseName;
    const baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')

      .clickWhenVisible('.design-doc-name > span', waitTime, false)
      .clickWhenVisible('a[href*="_info"]', waitTime, false)
      .clickWhenVisible('li > button.clipboard-copy-element', waitTime, false)
      .waitForElementVisible('.global-notification', waitTime, false)
      .assert.containsText('.global-notification > span', 'The MD5 sha has been copied to your clipboard.')
    .end();
  },

  'Copy Changes Feed Data to Clipboard Test' : (client) => {

    const waitTime = client.globals.maxWaitTime;
    const newDatabaseName = client.globals.testDatabaseName;
    const baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_changes')

      .clickWhenVisible('.change-wrapper:first-child .row-fluid:first-child .clipboard-copy-element', waitTime, false)
      .waitForElementVisible('.global-notification', waitTime, false)
      .assert.containsText('.global-notification > span', 'The document seq number has been copied to your clipboard.')
      .clickWhenVisible('.change-wrapper:first-child .row-fluid:nth-child(2) .clipboard-copy-element', waitTime, false)
      .waitForElementVisible('.global-notification', waitTime, false)
      .assert.containsText('.global-notification > span', 'The document ID has been copied to your clipboard.')
    .end();
  },

  'Cppy Document from Table View to Clipboard Test' : (client) => {
    const waitTime = client.globals.maxWaitTime;
    const newDatabaseName = client.globals.testDatabaseName;
    const baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')

      .clickWhenVisible('.fonticon-table', waitTime, false)
      .clickWhenVisible('.table-view-docs tr:first-child .clipboard-copy-element', waitTime, false)
      .waitForElementVisible('.global-notification', waitTime, false)
      .assert.containsText('.global-notification > span', 'The document content has been copied to the clipboard.')
    .end();
  }
};
