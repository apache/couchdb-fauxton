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
  'Deletes a document on json view': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName = 'delete_doc_doc',
        baseUrl = client.options.launch_url;

    client
      .createDocument(newDocumentName, newDatabaseName)
      .createDocument(newDocumentName + '2', newDatabaseName)
      .loginToGUI()
      .checkForDocumentCreated(newDocumentName)
      .checkForDocumentCreated(newDocumentName + '2')
      .url(baseUrl)
      .waitForElementPresent('#dashboard-content a[href="database/' + newDatabaseName + '/_all_docs"]', waitTime, false)
      .clickWhenVisible('#dashboard-content a[href="database/' + newDatabaseName + '/_all_docs"]', waitTime, false)
      .clickWhenVisible('.fonticon-json')
      .waitForElementVisible('label[for="checkbox-' + newDocumentName + '"]', waitTime, false)
      .clickWhenVisible('label[for="checkbox-' + newDocumentName + '"]', waitTime, false)
      .clickWhenVisible('.bulk-action-component-selector-group button.fonticon-trash', waitTime, false)
      .acceptAlert()
      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--info', waitTime, false)

      .waitForElementVisible('label[for="checkbox-' + newDocumentName + '2' + '"]', waitTime, false)
      .clickWhenVisible('label[for="checkbox-' + newDocumentName + '2' + '"]', waitTime, false)
      .clickWhenVisible('.bulk-action-component-selector-group button.fonticon-trash', waitTime, false)
      .acceptAlert()

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
  },

  'Deletes a document on table/metadata view': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName = 'delete_doc_doc',
        baseUrl = client.options.launch_url;

    client
      .createDocument(newDocumentName, newDatabaseName)
      .createDocument(newDocumentName + '2', newDatabaseName)
      .loginToGUI()
      .checkForDocumentCreated(newDocumentName)
      .checkForDocumentCreated(newDocumentName + '2')
      .url(baseUrl)
      .waitForElementPresent('#dashboard-content a[href="database/' + newDatabaseName + '/_all_docs"]', waitTime, false)
      .clickWhenVisible('#dashboard-content a[href="database/' + newDatabaseName + '/_all_docs"]', waitTime, false)
      .clickWhenVisible('#checkbox-' + newDocumentName, waitTime, false)
      .clickWhenVisible('.bulk-action-component-selector-group button.fonticon-trash', waitTime, false)
      .acceptAlert()
      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--info', waitTime, false)

      .clickWhenVisible('#checkbox-' + newDocumentName + '2', waitTime, false)
      .clickWhenVisible('.bulk-action-component-selector-group button.fonticon-trash', waitTime, false)
      .acceptAlert()

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
  },

  'Deleting a new Design Doc automatically removes it from the sidebar': function (client) {
    var waitTime = client.globals.maxWaitTime;
    var newDatabaseName = client.globals.testDatabaseName;
    var baseUrl = client.options.launch_url;
    var designDoc = {
      "_id": "_design/sidebar-update",
      "views": {
        "new-index": {
          "map": "function (doc) {\n  emit(doc._id, 1);\n}"
        }
      },
      "language": "javascript"
    };

    /*jshint multistr: true */
    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .createDocument(designDoc._id, newDatabaseName, designDoc)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('.fonticon-json')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, false)

      // confirm the design doc appears in the sidebar
      .waitForElementPresent('#sidebar-content span[title="_design/sidebar-update"]', waitTime, false)

      .execute('document.querySelector("div[data-id=\'_design/sidebar-update\']").scrollIntoView();')
      .clickWhenVisible('div[data-id="_design/sidebar-update"] label[for="checkbox-_design/sidebar-update"]', waitTime, false)

      .waitForElementPresent('.bulk-action-component-selector-group .fonticon-trash', waitTime, false)
      .execute('document.querySelector(".bulk-action-component-selector-group .fonticon-trash").scrollIntoView();')
      .clickWhenVisible('.bulk-action-component-selector-group .fonticon-trash')
      .acceptAlert()

      // now confirm it's gone
      .waitForElementNotPresent('#sidebar-content span[title="_design/sidebar-update"]', waitTime, false)
      .end();
  },

  'Deletes a document via Editor': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName = 'delete_doc_doc',
        baseUrl = client.options.launch_url;

    client
      .createDocument(newDocumentName, newDatabaseName)
      .checkForDocumentCreated(newDocumentName)
      .loginToGUI()
      .url(baseUrl + '#/database/' + newDatabaseName + '/' + newDocumentName)
      .waitForElementPresent('#editor-container', waitTime, false)
      .clickWhenVisible('#doc-editor-actions-panel button[title="Delete"]')
      .waitForElementVisible('.confirmation-modal', waitTime, false)
      .clickWhenVisible('.confirmation-modal button.btn.btn-primary')
      .waitForElementNotPresent('.confirmation-modal button.btn-primary', waitTime, true)
      .waitForElementPresent('.jump-to-doc', waitTime, false)

      //check raw JSON
      .url(baseUrl + '/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('pre', waitTime, false)
      .getText('pre', function (result) {
        var data = result.value,
            createdDocumentANotPresent = data.indexOf(newDocumentName) === -1;

        this.verify.ok(createdDocumentANotPresent,
          'Checking if new document no longer shows up in _all_docs.');
      })
      .end();
  },

};
