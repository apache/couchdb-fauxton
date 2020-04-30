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

  'Bulk deletes on json view': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName1 = 'bulktest1',
        newDocumentName2 = 'bulktest2',
        baseUrl = client.options.launch_url;

    client
      .loginToGUI()
      .createDocument(newDocumentName1, newDatabaseName)
      .createDocument(newDocumentName2, newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('.fonticon-json')
      .waitForElementPresent('.bulk-action-component-selector-group', waitTime, false)

      // ensures page content has loaded before proceeding
      .waitForElementVisible('.prettyprint', waitTime, false)

      .clickWhenVisible('.bulk-action-component-selector-group input[type="checkbox"]')
      .clickWhenVisible('.bulk-action-component-selector-group button.fonticon-trash', waitTime, false)
      .acceptAlert()
      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--info', waitTime, false)
      .waitForElementNotPresent('[data-id="' + newDocumentName1 + '"]', waitTime, false)
      .getText('body', function (result) {
        var data = result.value,
            isPresentFirstDoc = data.indexOf(newDocumentName1) !== -1,
            isPresentSecondDoc = data.indexOf(newDocumentName2) !== -1,
            bothMissing = !isPresentFirstDoc && !isPresentSecondDoc;

        this.verify.ok(bothMissing,
          'Checking if documents were deleted');
      })
      .end();
  },

  'Bulk deletes on table/metadata view': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName1 = 'bulktest1',
        newDocumentName2 = 'bulktest2',
        baseUrl = client.options.launch_url;

    client
      .loginToGUI()
      .createDocument(newDocumentName1, newDatabaseName)
      .createDocument(newDocumentName2, newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.bulk-action-component-selector-group', waitTime, false)

      // ensures page content has loaded before proceeding
      .waitForElementVisible('.table-view-docs', waitTime, false)

      .clickWhenVisible('.bulk-action-component-selector-group input[type="checkbox"]')
      .clickWhenVisible('.bulk-action-component-selector-group button.fonticon-trash', waitTime, false)
      .acceptAlert()
      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--info', waitTime, false)
      .waitForElementNotPresent('.table-view-docs ', waitTime, false)
      .getText('body', function (result) {
        var data = result.value,
            isPresentFirstDoc = data.indexOf(newDocumentName1) !== -1,
            isPresentSecondDoc = data.indexOf(newDocumentName2) !== -1,
            bothMissing = !isPresentFirstDoc && !isPresentSecondDoc;

        this.verify.ok(bothMissing,
          'Checking if documents were deleted');
      })
      .end();
  },

  'Select all works after changing the page': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .loginToGUI()
      .createManyDocuments(25, newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('.fonticon-json')

      // ensures page content has loaded before proceeding
      .waitForElementVisible('.prettyprint', waitTime, false)

      .clickWhenVisible('.bulk-action-component-selector-group input[type="checkbox"]')

      .waitForElementPresent('#next', waitTime, false)
      .clickWhenVisible('#next', waitTime, false)
      .waitForElementVisible('[data-id="27"]', waitTime, false)
      .waitForElementPresent('#previous', waitTime, false)
      .clickWhenVisible('#previous', waitTime, false)
      .waitForElementPresent('.bulk-action-component-selector-group input[type="checkbox"]:checked', waitTime, false)
      .end();
  }
};
