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

  'Finding things with mango': function (client) {
    /*jshint multistr: true */
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#database/' + newDatabaseName + '/_find')
      .waitForElementPresent('.watermark-logo', waitTime, false)
      .execute('\
        var json = \'{\
          "selector": {\
            "ente_ente_mango_ananas": {"$gt": null}\
          }\
        }\';\
        var editor = ace.edit("query-field");\
        editor.getSession().setValue(json);\
      ')
      .clickWhenVisible('#create-index-btn')
      .clickWhenVisible('.fonticon-json')

      .waitForElementPresent('.prettyprint', waitTime, false)
      .assert.textContains('#dashboard-lower-content', 'number')
      .assert.textContains('#dashboard-lower-content', 'ente_ente_mango_ananas_res')
      .end();
  }
};
