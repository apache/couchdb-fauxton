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
  'Edit document field using the String Editor' : (client) => {
    /*jshint multistr: true */
    const waitTime = client.globals.maxWaitTime,
          newDatabaseName = client.globals.testDatabaseName,
          newDocumentName = 'str_editor_document',
          baseUrl = client.options.launch_url;

    client
      .createDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_new')
      .waitForElementPresent('#editor-container', waitTime, false)
      .waitForElementPresent('.ace_gutter-active-line', waitTime, false)
      // Move editor cursor to _id field
      .execute('\
        var editor = ace.edit("doc-editor");\
        editor.gotoLine(2,4);\
      ')
      .clickWhenVisible('button.string-edit')
      // Check String Editor is displayed
      .waitForElementPresent('#string-editor-container', waitTime, false)
      .execute('\
        var str_editor = ace.edit("string-editor-container");\
        console.log(str_editor);\
        str_editor.setValue("' + newDocumentName + '");\
      ')
      .clickWhenVisible('#string-edit-save-btn')
      //Check String editor is no longer visible
      .waitForElementNotPresent('#string-editor-container', waitTime, false)
      //Check value has changed in the maind editor
      .waitForElementPresent('#editor-container', waitTime, false)
      .assert.textContains('span.ace_string', '"' + newDocumentName + '"')
      .end();
  }
};
