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
  'Creates a document' : (client) => {
    /*jshint multistr: true */
    const waitTime = client.globals.maxWaitTime,
          newDatabaseName = client.globals.testDatabaseName,
          newDocumentName = 'create_doc_document',
          baseUrl = client.options.launch_url;

    client
      .createDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('#new-all-docs-button a')
      .clickWhenVisible('#new-all-docs-button a[href="#/database/' + newDatabaseName + '/_new"]')
      .waitForElementPresent('#editor-container', waitTime, false)
      .verify.urlEquals(baseUrl + '/#/database/' + newDatabaseName + '/_new')
      .waitForElementPresent('.ace_gutter-active-line', waitTime, false)

      // confirm the header elements are showing up
      .waitForElementVisible('.faux-header__breadcrumbs', waitTime, true)
      .waitForElementVisible('.faux__jsonlink-link', waitTime, true)

      .execute('\
        var editor = ace.edit("doc-editor");\
        editor.gotoLine(2,10);\
        editor.removeWordRight();\
        editor.insert("' + newDocumentName + '");\
      ')

      .clickWhenVisible('#doc-editor-actions-panel .save-doc')
      .checkForDocumentCreated(newDocumentName)
      .url(baseUrl + '#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('.fonticon-json')
      .waitForElementVisible('.prettyprint', waitTime, false)
      .getText('.prettyprint', function (result) {
        const data = result.value;
        const createdDocIsPresent = data.indexOf(newDocumentName) !== -1;

        this.verify.ok(
          createdDocIsPresent,
          'Checking if new document shows up in _all_docs.'
        );
      })
      .end();
  },

  'Creates a _local document' : (client) => {
    /*jshint multistr: true */
    const waitTime = client.globals.maxWaitTime,
          newDatabaseName = client.globals.testDatabaseName,
          newDocumentName = '_local/create_doc_document',
          baseUrl = client.options.launch_url;

    client
      .createDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('#new-all-docs-button a')
      .clickWhenVisible('#new-all-docs-button a[href="#/database/' + newDatabaseName + '/_new"]')
      .waitForElementPresent('#editor-container', waitTime, false)
      .verify.urlEquals(baseUrl + '/#/database/' + newDatabaseName + '/_new')
      .waitForElementPresent('.ace_gutter-active-line', waitTime, false)

      // confirm the header elements are showing up
      .waitForElementVisible('.faux-header__breadcrumbs', waitTime, true)
      .waitForElementVisible('.faux__jsonlink-link', waitTime, true)

      .execute('\
        var editor = ace.edit("doc-editor");\
        editor.gotoLine(2,10);\
        editor.removeWordRight();\
        editor.insert("' + newDocumentName + '");\
      ')

      .clickWhenVisible('#doc-editor-actions-panel .save-doc')
      .checkForDocumentCreated(newDocumentName)
      .url(baseUrl + '#/database/' + newDatabaseName + '/' + newDocumentName)

      // Confirm the editor loaded successfully
      .waitForElementPresent('.ace_gutter-active-line', waitTime, false)
      .waitForElementVisible('.faux-header__breadcrumbs', waitTime, true)
      .waitForElementVisible('.faux__jsonlink-link', waitTime, true)
      .execute(function() {
        /*global ace*/
        return ace.edit("doc-editor").getValue();
      }, function (data) {
        const createdDocIsPresent = data.value.indexOf(newDocumentName) !== -1;

        this.verify.ok(
          createdDocIsPresent,
          'Checking if new document shows up in _all_docs.'
        );
      })
      .end();
  },

  'Creates a Document through Create Document toolbar button': (client) => {
    const waitTime = client.globals.maxWaitTime,
          newDatabaseName = client.globals.testDatabaseName,
          newDocumentName = 'a-create_doc_document',
          baseUrl = client.options.launch_url;

    client
      .createDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.tableview-checkbox-cell', waitTime, false)
      .clickWhenVisible('.document-result-screen__toolbar-create-btn')
      .waitForElementPresent('#editor-container', waitTime, false)
      .verify.urlEquals(baseUrl + '/#database/' + newDatabaseName + '/_new')
      .waitForElementPresent('.ace_gutter-active-line', waitTime, false)

      // confirm the header elements are showing up
      .waitForElementVisible('.faux-header__breadcrumbs', waitTime, true)
      .waitForElementVisible('.faux__jsondoc-wrapper', waitTime, true)

      .execute('\
        var editor = ace.edit("doc-editor");\
        editor.gotoLine(2,10);\
        editor.removeWordRight();\
        editor.insert("' + newDocumentName + '");\
      ')

      .clickWhenVisible('#doc-editor-actions-panel .save-doc')
      .checkForDocumentCreated(newDocumentName)
      .url(baseUrl + '#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('.fonticon-json')
      .waitForElementVisible('.prettyprint', waitTime, false)
      .getText('.prettyprint', function (result) {
        const data = result.value;
        const createdDocIsPresent = data.indexOf(newDocumentName) !== -1;
        this.verify.ok(
          createdDocIsPresent,
          'Checking if new document shows up in _all_docs.'
        );
      })
      .end();
  }
};
