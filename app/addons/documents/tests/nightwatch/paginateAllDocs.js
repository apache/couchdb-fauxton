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

  'change number of items per page': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')

      // ensures the header has been rendered
      .waitForElementPresent('.control-toggle-alternative-header', waitTime, false)

      // ensures the main body (results list) has been rendered
      .waitForElementPresent('.prettyprint', waitTime, false)

      // ensures the select dropdown is rendered
      .clickWhenVisible('#select-per-page', waitTime, false)

      // hack to get select working by clicking on it and using keyboard to select
      // http://www.w3.org/TR/2012/WD-webdriver-20120710/
      .keys(['\uE013', '\uE006'])
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('div[data-id="document_16"]', waitTime)
      .waitForElementPresent('.doc-row', waitTime, false)
      .execute(function () {
        return $('.doc-row').length;
      }, function (result) {
        client.assert.equal(result.value, 10);
      })
      .end();
  },

  'paginate to page two and back': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')

      // ensures the header is rendered
      .waitForElementPresent('.control-toggle-alternative-header', waitTime, false)

      // ensures the main body (results list) has been rendered
      .waitForElementPresent('.prettyprint', waitTime, false)

      .clickWhenVisible('#select-per-page', waitTime, false)
      // http://www.w3.org/TR/2012/WD-webdriver-20120710/
      .keys(['\uE013', '\uE006'])
      .waitForElementNotPresent('div[data-id="document_16"]', waitTime)
      .clickWhenVisible('#next', waitTime, false)
      .waitForElementPresent('div[data-id="document_17"]', waitTime)
      .clickWhenVisible('#previous', waitTime, false)
      .waitForElementPresent('div[data-id="document_1"]', waitTime)
      .end();
  },

  'PerPage change resets to page 1': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.control-toggle-alternative-header', waitTime, false)

      // ensures the main body (results list) has been rendered
      .waitForElementPresent('.prettyprint', waitTime, false)

      .clickWhenVisible('#select-per-page', waitTime, false)
      // http://www.w3.org/TR/2012/WD-webdriver-20120710/
      .keys(['\uE013', '\uE006'])
      .waitForElementNotPresent('div[data-id="document_16"]', waitTime)
      .clickWhenVisible('#next', waitTime, false)
      .waitForElementPresent('div[data-id="document_17"]', waitTime)
      .clickWhenVisible('#select-per-page', waitTime, false)
      // http://www.w3.org/TR/2012/WD-webdriver-20120710/
      .keys(['\uE013', '\uE006'])
      .waitForElementPresent('div[data-id="document_1"]', waitTime)
      .end();
  }
};
