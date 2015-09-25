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

  'Edits a design doc - set new index name': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    var viewUrl = newDatabaseName + '/_design/testdesigndoc/_view/hasenindex5000?limit=6&reduce=false';
    client
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .assert.containsText('.prettyprint', 'stub')
      .clearValue('#index-name')
      .setValue('#index-name', 'hasenindex5000')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'hasehase5000\', 1); }");\
      ')
      .execute('$("#save-view")[0].scrollIntoView();')
      .clickWhenVisible('#save-view')
      .checkForStringPresent(viewUrl, 'hasehase5000')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementVisible('.prettyprint', waitTime, false)
      .assert.containsText('.prettyprint', 'hasehase5000')
    .end();
  },

  'Edits a design doc': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    var viewUrl = newDatabaseName + '/_design/testdesigndoc/_view/stubview?limit=6&reduce=false';

    client
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .assert.containsText('.prettyprint', 'stub')

      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'hasehase6000\', 1); }");\
        editor._emit(\'blur\');\
      ')
      .execute('$("#save-view")[0].scrollIntoView();')

      .clickWhenVisible('#save-view')

      .checkForStringPresent(viewUrl, 'hasehase6000')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementVisible('.prettyprint', waitTime, false)
      .waitForAttribute('#doc-list', 'textContent', function (docContents) {
        return (/hasehase6000/).test(docContents);
      })
    .end();
  },

  'Edits two design docs to confirm Map Editor correct on second': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
      newDatabaseName = client.globals.testDatabaseName,
      baseUrl = client.globals.test_settings.launch_url,
      dropDownElement = '#header-dropdown-menu';

    client
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()

      // create the first view
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent(dropDownElement, waitTime, false)
      .clickWhenVisible(dropDownElement + ' a')
      .clickWhenVisible(dropDownElement + ' a[href*="new_view"]')
      .waitForElementVisible('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'view1-name')
      .clearValue('#index-name')
      .setValue('#index-name', 'view1')
      .clickWhenVisible('#reduce-function-selector')
      .keys(['\uE013', '\uE013', '\uE013', '\uE013', '\uE006'])
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(doc._id, 100); }");\
      ')
      .execute('$("#save-view")[0].scrollIntoView();')
      .clickWhenVisible('#save-view')
      .checkForDocumentCreated('_design/view1-name')
      .waitForElementPresent('.btn.btn-danger.delete', waitTime, false)

      // create the second view
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent(dropDownElement, waitTime, false)
      .clickWhenVisible(dropDownElement + ' a')
      .clickWhenVisible(dropDownElement + ' a[href*="new_view"]')
      .waitForElementVisible('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'view2-name')
      .clearValue('#index-name')
      .setValue('#index-name', 'view2')
      .clickWhenVisible('#reduce-function-selector')
      .keys(['\uE013', '\uE013', '\uE013', '\uE013', '\uE006'])
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(doc._id, 200); }");\
      ')
      .execute('$("#save-view")[0].scrollIntoView();')
      .clickWhenVisible('#save-view')
      .checkForDocumentCreated('_design/view2-name')
      .waitForElementPresent('.btn.btn-danger.delete', waitTime, false)

      // go back to the all docs page to ensure a page reload when we return to the Edit View page
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent(dropDownElement, waitTime, false)

      // now redirect back to first view and confirm the fields are all populated properly
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/view1-name/_view/view1')
      .waitForElementVisible('#save-view', waitTime, false)
      .execute(function () {
        var editor = window.ace.edit("map-function");
        return editor.getSession().getValue();
      }, [], function (resp) {
        this.assert.equal(resp.value, 'function (doc) { emit(doc._id, 100); }');
      })
      .end();
  },

  'Query Options are kept after a new reduce method is chosen': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    var viewUrl = newDatabaseName + '/_design/testdesigndoc/_view/stubview?reduce=true&group_level=0';

    client
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + viewUrl)
      .waitForElementPresent('.prettyprint', waitTime, false)
      .assert.containsText('.prettyprint', '20')
      .clickWhenVisible('#reduce-function-selector option[value="_sum"]')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'newstub\', 2); }");\
      ')
      .execute('$("#save-view")[0].scrollIntoView();')
      .clickWhenVisible('#save-view', waitTime, false)
      .checkForStringPresent(viewUrl, '40')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementVisible('.prettyprint', waitTime, false)
      .waitForAttribute('.prettyprint', 'textContent', function (docContents) {
        return (/40/).test(docContents);
      })
    .end();
  }
};
