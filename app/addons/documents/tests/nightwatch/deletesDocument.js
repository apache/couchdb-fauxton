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
  'Deletes a document': function (client) {
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName = 'delete_doc_doc',
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .createDocument(newDocumentName, newDatabaseName)
      .url(baseUrl)
      .waitForElementPresent('#dashboard-content a[href="#/database/' + newDatabaseName + '/_all_docs"]', waitTime, false)
      .click('#dashboard-content a[href="#/database/' + newDatabaseName + '/_all_docs"]')
      .waitForElementVisible('label[for="checkbox-' + newDocumentName + '"]', waitTime, false)
      .click('label[for="checkbox-' + newDocumentName + '"]')
      .click('.control-toggle-alternative-header')
      .waitForElementPresent('.control-select-all', waitTime, false)
      .click('.control-delete')
      .acceptAlert()
      .waitForElementVisible('#global-notifications .alert.alert-info', waitTime, false)
      .url(baseUrl + '/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('pre', waitTime, false)
      .getText('pre', function (result) {
        var data = result.value,
            createdDocumentNotPresent = data.indexOf(newDocumentName);

        this.verify.ok(createdDocumentNotPresent === -1,
          'Checking if new document no longer shows up in _all_docs.');
      })
    .end();
  }
};
