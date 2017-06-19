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

  'Select doc via typeahead field redirects user': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName, 3)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('.fonticon-json')
      .waitForElementPresent('.jump-to-doc', waitTime, false)
      .keys(['\uE00C'])
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementPresent('.documents-pagination', waitTime, false)
      // we need to explicitly show the doc field because it's hidden on Travis due to screen width
      .execute("$('.searchbox-wrapper').show();")
      .setValue('.jump-to-doc .Select-input input', ['_des'])
      .waitForElementPresent('.Select-option', waitTime, false)
      .keys(['\uE015', '\uE015', '\uE006'])
      .waitForElementPresent('.panel-button.upload', waitTime, false)
    .end();
  },

  'Select doc works for capitalised id': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .createDocument('MY_CAP_DOC_ID', newDatabaseName, {value: 1, value: 2})
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('.fonticon-json')
      .waitForElementPresent('.jump-to-doc', waitTime, false)
      .keys(['\uE00C'])
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementPresent('.documents-pagination', waitTime, false)
      // we need to explicitly show the doc field because it's hidden on Travis due to screen width
      .execute("$('.searchbox-wrapper').show();")
      .setValue('.jump-to-doc .Select-input input', ['MY_CAP'])
      .waitForElementPresent('.Select-option', waitTime, false)
      .keys(['\uE015', '\uE015', '\uE006'])
      .waitForElementPresent('.panel-button.upload', waitTime, false)
    .end();
  }
};
