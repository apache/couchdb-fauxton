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
        baseUrl = client.options.launch_url;

    client
      .deleteDatabase(newDatabaseName)
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview/edit')
      .waitForElementPresent('.index-cancel-link', waitTime, true)
      .waitForElementNotPresent('.loading-lines', waitTime, true)
      .waitForElementVisible('#index-name', waitTime, true)
      .waitForElementPresent('.faux-header__doc-header-title', waitTime, false)
      .getText('.faux-header__doc-header-title', function (result) {
        const headerContent = result && result.value;
        const regExp = new RegExp(newDatabaseName);
        this.verify.ok(
          regExp.test(headerContent),
          `expected header text to contain '${newDatabaseName}' and found '${headerContent}'`
        );
      })
      .waitForAttribute('#index-name', 'value', function (val) {
        return val === 'stubview';
      })
      .clearValue('#index-name')
      .setValue('#index-name', 'hasenindex5000')

      .clickWhenVisible('#save-view')

      // confirm the new index name is present
      .waitForElementVisible('#testdesigndoc_hasenindex5000', waitTime, false)
      .end();
  },

  'Edits a design doc': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    var viewUrl = newDatabaseName + '/_design/testdesigndoc/_view/stubview?limit=6&reduce=false';

    client
      .deleteDatabase(newDatabaseName)
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()

      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview/edit')
      .waitForElementPresent('.index-cancel-link', waitTime, true)
      .waitForElementNotPresent('.loading-lines', waitTime, true)
      .waitForElementVisible('#index-name', waitTime, true)
      .waitForElementPresent('.faux-header__doc-header-title', waitTime, false)
      .getText('.faux-header__doc-header-title', function (result) {
        const headerContent = result && result.value;
        const regExp = new RegExp(newDatabaseName);
        this.verify.ok(
          regExp.test(headerContent),
          `expected header text to contain '${newDatabaseName}' and found '${headerContent}'`
        );
      })

      .waitForAttribute('#index-name', 'value', function (val) {
        return val === 'stubview';
      })

      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'hasehase6000\', 1); }");\
        editor._emit(\'blur\');\
      ')
      .clickWhenVisible('#save-view')

      .checkForStringPresent(viewUrl, 'hasehase6000')
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .clickWhenVisible('.fonticon-json')
      .waitForElementVisible('.prettyprint', waitTime, false)
      .waitForElementPresent('.faux-header__doc-header-title', waitTime, false)
      .getText('.faux-header__doc-header-title', function (result) {
        const headerContent = result && result.value;
        const regExp = new RegExp(newDatabaseName);
        this.verify.ok(
          regExp.test(headerContent),
          `expected header text to contain '${newDatabaseName}' and found '${headerContent}'`
        );
      })
      .getText('#doc-list', function (result) {
        const textContent = result && result.value;
        this.verify.ok(
          (/hasehase6000/).test(textContent),
          `expected doc list to contain 'hasehase6000'`
        );
      })
      .end();
  },

  'Edits two design docs to confirm Map Editor correct on second': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .deleteDatabase(newDatabaseName)
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()

      // create the first view
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('.faux-header__doc-header-dropdown-toggle')
      .clickWhenVisible('.faux-header__doc-header-dropdown-itemwrapper a[href*="new_view"]')
      .waitForElementNotPresent('.loading-lines', waitTime, true)
      .waitForElementPresent('.faux-header__doc-header-title', waitTime, false)
      .getText('.faux-header__doc-header-title', function (result) {
        const headerContent = result && result.value;
        const regExp = new RegExp(newDatabaseName);
        this.verify.ok(
          regExp.test(headerContent),
          `expected header text to contain '${newDatabaseName}' and found '${headerContent}'`
        );
      })
      .waitForElementVisible('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc', 'view1-name')
      .clearValue('#index-name')
      .setValue('#index-name', 'view1')
      .clickWhenVisible('select[id="reduce-function-selector"] option[value="_sum"]')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(doc._id, 100); }");\
      ')
      .clickWhenVisible('#save-view')
      .checkForDocumentCreated('_design/view1-name')
      // create the second view
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')

      .clickWhenVisible('.faux-header__doc-header-dropdown-toggle')
      .clickWhenVisible('.faux-header__doc-header-dropdown-itemwrapper a[href*="new_view"]')

      .waitForElementPresent('.index-cancel-link', waitTime, false)
      .waitForElementVisible('#new-ddoc', waitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, true)
      .waitForElementPresent('.faux-header__doc-header-title', waitTime, false)
      .getText('.faux-header__doc-header-title', function (result) {
        const headerContent = result && result.value;
        const regExp = new RegExp(newDatabaseName);
        this.verify.ok(
          regExp.test(headerContent),
          `expected header text to contain '${newDatabaseName}' and found '${headerContent}'`
        );
      })

      .setValue('#new-ddoc', 'view2-name')
      .clearValue('#index-name')
      .setValue('#index-name', 'view2')
      .clickWhenVisible('select[id="reduce-function-selector"] option[value="_count"]')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(doc._id, 200); }");\
      ')
      .clickWhenVisible('#save-view')
      .checkForDocumentCreated('_design/view2-name')

      // now redirect back to first view and confirm the fields are all populated properly
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/view1-name/_view/view1/edit')

      .waitForElementNotPresent('.loading-lines', waitTime, true)
      .waitForElementVisible('#save-view', waitTime, false)
      .waitForElementPresent('.faux-header__doc-header-title', waitTime, false)
      .getText('.faux-header__doc-header-title', function (result) {
        const headerContent = result && result.value;
        const regExp = new RegExp(newDatabaseName);
        this.verify.ok(
          regExp.test(headerContent),
          `expected header text to contain '${newDatabaseName}' and found '${headerContent}'`
        );
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
        baseUrl = client.options.launch_url;

    client
      .deleteDatabase(newDatabaseName)
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview')
      .clickWhenVisible('.fonticon-json')
      .waitForElementPresent('.prettyprint', waitTime, false)

      // confirm the sidebar shows the testdesigndoc design doc
      .waitForElementVisible('#design-doc-menu-testdesigndoc', waitTime, true)

      .waitForElementPresent('.faux-header__doc-header-title', waitTime, false)
      .getText('.faux-header__doc-header-title', function (result) {
        const headerContent = result && result.value;
        const regExp = new RegExp(newDatabaseName);
        this.verify.ok(
          regExp.test(headerContent),
          `expected header text to contain '${newDatabaseName}' and found '${headerContent}'`
        );
      })

      // now edit the view and move it into a brand new design doc
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview/edit')
      .waitForElementPresent('.faux-header__doc-header-title', waitTime, false)
      .getText('.faux-header__doc-header-title', function (result) {
        const headerContent = result && result.value;
        const regExp = new RegExp(newDatabaseName);
        this.verify.ok(
          regExp.test(headerContent),
          `expected header text to contain '${newDatabaseName}' and found '${headerContent}'`
        );
      })

      .waitForElementPresent('.index-cancel-link', waitTime, true)
      .waitForElementVisible('.styled-select select', waitTime, true)
      .waitForElementNotPresent('.loading-lines', waitTime, true)
      .clickWhenVisible('select[id="faux__edit-view__design-doc"] option[value="new-doc"]')

      // needed to get React to update + show the new design doc field
      .click('body')

      .waitForElementPresent('#new-ddoc', waitTime, true)
      .execute('document.querySelector("#new-ddoc").scrollIntoView();')
      .setValue('#new-ddoc', 'brand-new-ddoc')
      .clickWhenVisible('#save-view')

      // now wait for the old design doc to be gone, and the new one to have shown up
      .waitForElementNotPresent('#testdesigndoc', waitTime, true)
      .waitForElementPresent('#design-doc-menu-brand-new-ddoc', waitTime, true)
      .end();
  }

};
