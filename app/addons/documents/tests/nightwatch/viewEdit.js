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

  'Edits a design doc - renames index': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .deleteDatabase(newDatabaseName)
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview/edit')
      .waitForElementPresent('.index-cancel-link', waitTime, true)
      .waitForElementNotPresent('.spinner', waitTime, true)
      .waitForElementNotPresent('.loading-lines', waitTime, true)
      .waitForElementVisible('#index-name', waitTime, true)
      .waitForElementPresent('.breadcrumb .js-lastelement', waitTime, false)
      .waitForAttribute('.breadcrumb .js-lastelement', 'textContent', function (docContents) {
        var regExp = new RegExp(newDatabaseName);
        return regExp.test(docContents);
      })

      .waitForAttribute('#index-name', 'value', function (val) {
        return val === 'stubview';
      })
      .clearValue('#index-name')
      .setValue('#index-name', 'hasenindex5000')

      .execute('$("#save-view")[0].scrollIntoView();')
      .clickWhenVisible('#save-view')

      // confirm the new index name is present
      .waitForElementVisible('#testdesigndoc_hasenindex5000', waitTime, false)
    .end();
  },

  'Edits a design doc': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    var viewUrl = newDatabaseName + '/_design/testdesigndoc/_view/stubview?limit=6&reduce=false';

    client
      .deleteDatabase(newDatabaseName)
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()

      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview/edit')
      .waitForElementPresent('.index-cancel-link', waitTime, true)
      .waitForElementNotPresent('.spinner', waitTime, true)
      .waitForElementNotPresent('.loading-lines', waitTime, true)
      .waitForElementVisible('#index-name', waitTime, true)
      .waitForElementPresent('.breadcrumb .js-lastelement', waitTime, false)
      .waitForAttribute('.breadcrumb .js-lastelement', 'textContent', function (docContents) {
        var regExp = new RegExp(newDatabaseName);
        return regExp.test(docContents);
      })

      .waitForAttribute('#index-name', 'value', function (val) {
        return val === 'stubview';
      })

      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'hasehase6000\', 1); }");\
        editor._emit(\'blur\');\
      ')
      .execute('$("#save-view")[0].scrollIntoView();')
      .clickWhenVisible('#save-view')

      .checkForStringPresent(viewUrl, 'hasehase6000')
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementNotPresent('.spinner', waitTime, false)
      .waitForElementVisible('.prettyprint', waitTime, false)
      .waitForElementPresent('.breadcrumb .js-lastelement', waitTime, false)
      .waitForAttribute('.breadcrumb .js-lastelement', 'textContent', function (docContents) {
        var regExp = new RegExp(newDatabaseName);
        return regExp.test(docContents);
      })
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
      .deleteDatabase(newDatabaseName)
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()

      // create the first view
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent(dropDownElement, waitTime, false)
      .clickWhenVisible(dropDownElement + ' a')
      .clickWhenVisible(dropDownElement + ' a[href*="new_view"]')
      .waitForElementNotPresent('.spinner', waitTime, true)
      .waitForElementNotPresent('.loading-lines', waitTime, true)
      .waitForElementPresent('.breadcrumb .js-lastelement', waitTime, false)
      .waitForAttribute('.breadcrumb .js-lastelement', 'textContent', function (docContents) {
        var regExp = new RegExp(newDatabaseName);
        return regExp.test(docContents);
      })

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

      // create the second view
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent(dropDownElement, waitTime, false)
      .clickWhenVisible(dropDownElement + ' a')
      .clickWhenVisible(dropDownElement + ' a[href*="new_view"]')
      .waitForElementVisible('#new-ddoc', waitTime, false)
      .waitForElementNotPresent('.spinner', waitTime, true)
      .waitForElementNotPresent('.loading-lines', waitTime, true)
      .waitForElementPresent('.breadcrumb .js-lastelement', waitTime, false)
      .waitForAttribute('.breadcrumb .js-lastelement', 'textContent', function (docContents) {
        var regExp = new RegExp(newDatabaseName);
        return regExp.test(docContents);
      })

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

      // now redirect back to first view and confirm the fields are all populated properly
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/view1-name/_view/view1/edit')

      .waitForElementNotPresent('.spinner', waitTime, true)
      .waitForElementNotPresent('.loading-lines', waitTime, true)
      .waitForElementVisible('#save-view', waitTime, false)
      .waitForElementPresent('.breadcrumb .js-lastelement', waitTime, false)
      .waitForAttribute('.breadcrumb .js-lastelement', 'textContent', function (docContents) {
        var regExp = new RegExp(newDatabaseName);
        return regExp.test(docContents);
      })

      .execute(function () {
        var editor = window.ace.edit("map-function");
        return editor.getSession().getValue();
      }, [], function (resp) {
        this.assert.equal(resp.value, 'function (doc) { emit(doc._id, 100); }');
      })
      .end();
  },

  'Editing a view and putting it into a new design doc removes it from the old design doc': function (client) {
    var waitTime = client.globals.maxWaitTime,
      newDatabaseName = client.globals.testDatabaseName,
      baseUrl = client.globals.test_settings.launch_url;

    client
      .deleteDatabase(newDatabaseName)
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview')
      .waitForElementPresent('.prettyprint', waitTime, false)

      // confirm the sidebar shows the testdesigndoc design doc
      .waitForElementVisible('#testdesigndoc', waitTime, true)

      .waitForElementPresent('.breadcrumb .js-lastelement', waitTime, false)
      .waitForAttribute('.breadcrumb .js-lastelement', 'textContent', function (docContents) {
        var regExp = new RegExp(newDatabaseName);
        return regExp.test(docContents);
      })

      // now edit the view and move it into a brand new design doc
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview/edit')
      .waitForElementPresent('.breadcrumb .js-lastelement', waitTime, false)
      .waitForAttribute('.breadcrumb .js-lastelement', 'textContent', function (docContents) {
        var regExp = new RegExp(newDatabaseName);
        return regExp.test(docContents);
      })

      .waitForElementPresent('.index-cancel-link', waitTime, true)
      .waitForElementVisible('select#ddoc', waitTime, true)
      .waitForElementNotPresent('.spinner', waitTime, true)
      .waitForElementNotPresent('.loading-lines', waitTime, true)

      .setValue('select#ddoc', 'new-doc')

      // needed to get React to update + show the new design doc field
      .click('body')

      .waitForElementPresent('#new-ddoc', waitTime, true)
      .execute('$("#new-ddoc")[0].scrollIntoView();')
      .setValue('#new-ddoc', 'brand-new-ddoc')
      .execute('$("#save-view")[0].scrollIntoView();')
      .clickWhenVisible('#save-view')

      // now wait for the old design doc to be gone, and the new one to have shown up
      .waitForElementNotPresent('#testdesigndoc', waitTime, true)
      .waitForElementPresent('#brand-new-ddoc', waitTime, true)
      .end();
  }

};
