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
  'Creates a document' : function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName = 'create_doc_document',
        baseUrl = client.globals.test_settings.launch_url;

    client
      .createDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('#new-all-docs-button a')
      .clickWhenVisible('#new-all-docs-button a[href="#/database/' + newDatabaseName + '/new"]')
      .waitForElementPresent('#editor-container', waitTime, false)
      .verify.urlEquals(baseUrl + '/#/database/' + newDatabaseName + '/new')
      .waitForElementPresent('.ace_gutter-active-line', waitTime, false)

      // confirm the header elements are showing up
      .waitForElementVisible('.faux-header__breadcrumbs', waitTime, true)
      .waitForElementVisible('#api-navbar', waitTime, true)

      .execute('\
        var editor = ace.edit("doc-editor");\
        editor.gotoLine(2,10);\
        editor.removeWordRight();\
        editor.insert("' + newDocumentName + '");\
      ')

      .clickWhenVisible('#doc-editor-actions-panel .save-doc')
      .checkForDocumentCreated(newDocumentName)
      .url(baseUrl + '/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('body', waitTime, false)
      .getText('body', function (result) {
        var data = result.value,
            createdDocIsPresent = data.indexOf(newDocumentName);

        this.verify.ok(createdDocIsPresent > 0,
          'Checking if new document shows up in _all_docs.');
      })
    .end();
  }
};
