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
  'Edits a design doc': function (client) {
    /*jshint multistr: true */
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
       .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .assert.containsText('.prettyprint', 'stub')
      .clearValue('#index-name')
      .setValue('#index-name', 'hasenindex5000')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("function (doc) { emit(\'hasehase5000\'); }");\
      ')
      .waitForElementPresent('button.btn-success.save', waitTime, false)
      .click('button.btn-success.save')
      .waitForElementNotVisible('.global-notification', waitTime, false)
      .assert.containsText('.prettyprint', 'hasehase5000')
    .end();
  }
};
