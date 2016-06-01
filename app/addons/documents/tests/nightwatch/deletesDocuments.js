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
      .checkForDocumentCreated(newDocumentName)
      .checkForDocumentCreated(newDocumentName + '2')
      .url(baseUrl)
      .waitForElementPresent('#dashboard-content a[href="#/database/' + newDatabaseName + '/_all_docs"]', waitTime, false)
      .clickWhenVisible('#dashboard-content a[href="#/database/' + newDatabaseName + '/_all_docs"]', waitTime, false)
      .waitForElementVisible('label[for="checkbox-' + newDocumentName + '"]', waitTime, false)
      .clickWhenVisible('label[for="checkbox-' + newDocumentName + '"]', waitTime, false)
      .clickWhenVisible('.bulk-action-component-selector-group button.fonticon-trash', waitTime, false)
      .acceptAlert()
      .waitForElementVisible('.alert.alert-info', waitTime, false)

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

  'Deleting a new Design Doc automatically removes it from the sidebar': function (client) {
    var waitTime = client.globals.maxWaitTime;
    var newDatabaseName = client.globals.testDatabaseName;
    var baseUrl = client.globals.test_settings.launch_url;

    /*jshint multistr: true */
    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('#header-dropdown-menu', waitTime, false)
      .waitForElementPresent('#header-dropdown-menu a', waitTime, false)
      .clickWhenVisible('#header-dropdown-menu a', waitTime, false)
      .waitForElementPresent('#header-dropdown-menu  a[href*="new_view"]', waitTime, false)
      .clickWhenVisible('#header-dropdown-menu a[href*="new_view"]', waitTime, false)
      .waitForElementPresent('.index-cancel-link', waitTime, false)
      .waitForElementPresent('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'sidebar-update')
      .clearValue('#index-name')
      .setValue('#index-name', 'sidebar-update-index')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'1\'); }");\
      ')
      .execute('$("#save-view")[0].scrollIntoView();')
      .waitForElementPresent('#save-view', waitTime, false)
      .clickWhenVisible('#save-view', waitTime, false)
      .waitForElementVisible('#global-notifications .alert.alert-success', waitTime, false)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, false)

      // confirm the design doc appears in the sidebar
      .waitForElementPresent('#sidebar-content span[title="_design/sidebar-update"]', waitTime, false)
      .waitForElementPresent('label[for="checkbox-_design/sidebar-update"]', waitTime, false)
      .execute('$("label[for=\'checkbox-_design/sidebar-update\']")[0].scrollIntoView();')
      .clickWhenVisible('label[for="checkbox-_design/sidebar-update"]', waitTime, false)

      .waitForElementPresent('.bulk-action-component-selector-group .fonticon-trash', waitTime, false)
      .execute('$(".bulk-action-component-selector-group .fonticon-trash")[0].scrollIntoView();')
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
        baseUrl = client.globals.test_settings.launch_url;

    client
      .createDocument(newDocumentName, newDatabaseName)
      .checkForDocumentCreated(newDocumentName)
      .loginToGUI()
      .url(baseUrl + '#/database/' + newDatabaseName + '/' + newDocumentName)
      .waitForElementPresent('#editor-container', waitTime, false)
      .clickWhenVisible('#doc-editor-actions-panel button[title="Delete"]')
      .clickWhenVisible('.confirmation-modal button.btn.btn-success')
      .waitForElementPresent('#jump-to-doc', waitTime, false)

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
