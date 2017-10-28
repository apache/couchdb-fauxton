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
  'Clones a document via Editor': function (client) {
    const waitTime = client.globals.maxWaitTime;
    const newDatabaseName = client.globals.testDatabaseName;
    const newDocumentName = 'clone_doc_doc';
    const baseUrl = client.globals.test_settings.launch_url;

    client
      .createDocument(newDocumentName, newDatabaseName)
      .checkForDocumentCreated(newDocumentName)
      .loginToGUI()

      .url(baseUrl + '#/database/' + newDatabaseName + '/' + newDocumentName)
      .waitForElementPresent('#editor-container', waitTime, false)
      .clickWhenVisible('#doc-editor-actions-panel button[title="Clone Document"]')

      .waitForElementVisible('.clone-doc-modal input', waitTime, false)

      .clickWhenVisible('.clone-doc-modal input')

      .clearValue('.clone-doc-modal input')
      .setValue('.clone-doc-modal input', ['ente'])

      .clickWhenVisible('.clone-doc-modal button.btn.btn-primary')
      .closeNotification()

      .waitForAttribute('.faux-header__breadcrumbs .faux-header__breadcrumbs-element:last-child', 'textContent', function (docContents) {
        return 'ente' === docContents.trim();
      })

      .url(`${baseUrl}'/'${newDatabaseName}/${newDocumentName}`)
      .waitForElementPresent('#editor-container', waitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .getText('#editor-container', function (result) {
        const data = result.value;
        const isCreatedDocumentPresent = data.indexOf('ente') !== -1;

        this.verify.ok(
          isCreatedDocumentPresent,
          'check that document is correctly reloaded'
        );
      })
    .end();
  },
};
