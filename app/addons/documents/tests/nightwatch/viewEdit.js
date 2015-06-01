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
      .execute('$(".save")[0].scrollIntoView();')
      .clickWhenVisible('button.btn-success.save')
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
      .execute('$(".save")[0].scrollIntoView();')

      .clickWhenVisible('button.btn-success.save')

      .checkForStringPresent(viewUrl, 'hasehase6000')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementVisible('.prettyprint', waitTime, false)
      .waitForAttribute('#doc-list', 'textContent', function (docContents) {
        return (/hasehase6000/).test(docContents);
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
      .execute('$("button.save")[0].scrollIntoView();')
      .clickWhenVisible('button.save', waitTime, false)
      .checkForStringPresent(viewUrl, '40')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementVisible('.prettyprint', waitTime, false)
      .waitForAttribute('.prettyprint', 'textContent', function (docContents) {
        return (/40/).test(docContents);
      })
    .end();
  }
};
