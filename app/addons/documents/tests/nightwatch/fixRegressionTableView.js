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

  'Does not crash the table view': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName1 = 'bulktest1',
        newDocumentName2 = 'bulktest2',
        baseUrl = client.globals.test_settings.launch_url;

    client
      .createDocument(newDocumentName1, newDatabaseName)
      .createDocument(newDocumentName2, newDatabaseName)
      .loginToGUI()
      .checkForDocumentCreated(newDocumentName1)
      .checkForDocumentCreated(newDocumentName2)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')

      .clickWhenVisible('.fonticon-pencil', client.globals.maxWaitTime, false)
      .clickWhenVisible('.faux-header__breadcrumbs-link')
      .clickWhenVisible('.fonticon-table', client.globals.maxWaitTime, false)
      .waitForElementVisible('.tableview-checkbox-cell', client.globals.maxWaitTime, false)
      .waitForElementVisible('.tableview-data-cell-id', client.globals.maxWaitTime, false)
      .clickWhenVisible('.tableview-data-cell-id a', client.globals.maxWaitTime, false)
      .waitForElementVisible('#doc-editor-actions-panel', client.globals.maxWaitTime, false)
      .end();
  },
};
