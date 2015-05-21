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

  'Finding things with with mango': function (client) {
    /*jshint multistr: true */
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_find')
      .waitForElementPresent('.watermark-logo', waitTime, false)
      .assert.containsText('.editor-description', 'is an easy way to find documents on predefined indexes')
      .execute('\
        var json = \'{\
          "selector": {\
            "ente_ente_mango_ananas": {"$gt": null}\
          }\
        }\';\
        var editor = ace.edit("query-field");\
        editor.getSession().setValue(json);\
      ')
      .execute('$(".save")[0].scrollIntoView();')
      .click('button.btn-success.save')

      .waitForElementPresent('.prettyprint', waitTime, false)
      .assert.containsText('#dashboard-lower-content', 'number')
      .assert.containsText('#dashboard-lower-content', 'ente_ente_mango_ananas_res')
    .end();
  }
};
