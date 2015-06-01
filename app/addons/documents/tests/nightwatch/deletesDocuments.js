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
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName = 'delete_doc_doc',
        baseUrl = client.globals.test_settings.launch_url;

    client
      .createDocument(newDocumentName, newDatabaseName)
      .createDocument(newDocumentName + '2', newDatabaseName)
      .loginToGUI()
      .url(baseUrl)
      .waitForElementPresent('#dashboard-content a[href="#/database/' + newDatabaseName + '/_all_docs"]', waitTime, false)
      .clickWhenVisible('#dashboard-content a[href="#/database/' + newDatabaseName + '/_all_docs"]', waitTime, false)
      .waitForElementVisible('label[for="checkbox-' + newDocumentName + '"]', waitTime, false)
      .clickWhenVisible('label[for="checkbox-' + newDocumentName + '"]', waitTime, false)
      .waitForElementPresent('.control-select-all', waitTime, false)
      .clickWhenVisible('.control-delete')
      .acceptAlert()
      .waitForElementVisible('label[for="checkbox-' + newDocumentName + '2' + '"]', waitTime, false)
      .clickWhenVisible('label[for="checkbox-' + newDocumentName + '2' + '"]', waitTime, false)
      .waitForElementPresent('.control-select-all', waitTime, false)
      .clickWhenVisible('.control-delete')
      .acceptAlert()

      .waitForElementVisible('.alert.alert-info', waitTime, false)
      .checkForStringNotPresent(newDatabaseName + '/_all_docs', newDocumentName)
      .checkForStringNotPresent(newDatabaseName + '/_all_docs', newDocumentName + '2')
      .url(baseUrl + '/' + newDatabaseName + '/_all_docs')

      .waitForElementPresent('pre', waitTime, false)
      .getText('pre', function (result) {
        var data = result.value,
            createdDocumentANotPresent = data.indexOf(newDocumentName) === -1,
            createdDocumentBNotPresent = data.indexOf(newDocumentName + '2') === -1;

        this.verify.ok(createdDocumentANotPresent && createdDocumentBNotPresent,
          'Checking if new documents no longer shows up in _all_docs.');
      })
    .end();
  }
};
