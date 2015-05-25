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

  'Creating new indexes with mango (mangoIndex.js)': function (client) {
    /*jshint multistr: true */

    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_index')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .execute('\
        var json = \'{\
          "index": {\
            "fields": ["gans_gans_mango"]\
          },\
          "name": "rocko-artischocko",\
          "type" : "json"\
        }\';\
        var editor = ace.edit("query-field");\
        editor.getSession().setValue(json);\
      ')
      .execute('$(".save")[0].scrollIntoView();')
      .clickWhenVisible('button.btn-success.save')
      .checkForStringPresent(newDatabaseName + '/_index', 'rocko-artischocko')
      .checkForStringPresent(newDatabaseName + '/_index', 'gans_gans_mango')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .assert.containsText('#dashboard-lower-content', 'gans_gans_mango')
    .end();
  },

  'Deleting new named indexes with mango': function (client) {
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_index')
      .waitForElementPresent('.control-toggle-alternative-header', waitTime, false)
      .clickWhenVisible('.control-toggle-alternative-header')
      .assert.containsText('#dashboard-lower-content', 'ente_ente_mango_ananas')
      .waitForElementPresent('.control-select-all', waitTime, false)
      .clickWhenVisible('.control-select-all')
      .clickWhenVisible('.control-delete')
      .acceptAlert()

      .checkForStringNotPresent(newDatabaseName + '/_index', '"name":"rocko-artischocko"')
      .checkForStringNotPresent(newDatabaseName + '/_index', 'gans_gans_mango')
      .getText('body', function (result) {
        var data = result.value;

        this.verify.ok(data.indexOf('ente_ente_mango_ananas') === -1,
          'Checking if documents were deleted');
      })
      .end();
  }
};
