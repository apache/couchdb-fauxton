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

  'Shows data in the full table for all docs (include docs enabled)': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName1 = 'bulktest1',
        newDocumentName2 = 'bulktest2',
        baseUrl = client.options.launch_url;

    client
      .createDocument(newDocumentName1, newDatabaseName)
      .createDocument(newDocumentName2, newDatabaseName)
      .loginToGUI()
      .checkForDocumentCreated(newDocumentName1)
      .checkForDocumentCreated(newDocumentName2)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('.fonticon-table')

      .waitForElementVisible('.tableview-checkbox-cell', waitTime, false)
      .waitForElementVisible('.table', waitTime, false)
      .getText('.table', function (result) {
        var data = result.value;

        if (!data.indexOf) {
          console.error('check your selenium test, race condition');
        }

        this.verify.ok(data.indexOf('testingValue') !== -1,
          'Check if doc content is shown in table');
      })

      .end();
  },

  'Shows data in the metadata table for all docs (include docs disabled)': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName1 = 'bulktest1',
        newDocumentName2 = 'bulktest2',
        baseUrl = client.options.launch_url;

    client
      .createDocument(newDocumentName1, newDatabaseName)
      .createDocument(newDocumentName2, newDatabaseName)
      .loginToGUI()
      .checkForDocumentCreated(newDocumentName1)
      .checkForDocumentCreated(newDocumentName2)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .assert.textContains('button.active', 'Metadata')
      .waitForElementVisible('.tableview-checkbox-cell', waitTime, false)
      .waitForElementVisible('.table', waitTime, false)
      .getText('.table', function (result) {
        var data = result.value;

        if (!data.indexOf) {
          console.error('check your selenium test, race condition');
        }

        this.verify.ok(data.indexOf('bulktest1') !== -1,
          'Check if doc content is shown in table');
      })

      .end();
  },
};
