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
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/keyview/_view/keyview')
      .waitForElementPresent('#toggle-query', waitTime, false)
      .click('#select-per-page')
      // hack to get select working by clicking on it and using keyboard to select
      // http://www.w3.org/TR/2012/WD-webdriver-20120710/
      .keys(['\uE013', '\uE006'])
      .waitForElementNotPresent('.spinner', waitTime)
      .execute(function () {
        return $('.doc-row').length;
      }, function (result) {
          client.assert.equal(result.value, 10);
      })
      .end();
  },

  'paginate to page two and back': function (client) {
    /*jshint multistr: true */
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/keyview/_view/keyview')
      .waitForElementPresent('#toggle-query', waitTime, false)
      .click('#select-per-page')
      // http://www.w3.org/TR/2012/WD-webdriver-20120710/
      .keys(['\uE013', '\uE006'])
      .waitForElementNotPresent('.spinner', waitTime)
      .click('#next')
      .waitForElementNotPresent('.spinner', waitTime)
      .waitForElementPresent('div[data-id="document_19"]', waitTime)
      .click('#previous')
      .waitForElementNotPresent('.spinner', waitTime)
      .waitForElementPresent('div[data-id="document_1"]', waitTime)
      .end();
  },

  'PerPage change resets to page 1': function (client) {
    /*jshint multistr: true */
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/keyview/_view/keyview')
      .waitForElementPresent('#toggle-query', waitTime, false)
      .click('#select-per-page')
      // http://www.w3.org/TR/2012/WD-webdriver-20120710/
      .keys(['\uE013', '\uE006'])
      .waitForElementNotPresent('.spinner', waitTime)
      .click('#next')
      .waitForElementNotPresent('.spinner', waitTime)
      .click('#select-per-page')
      // http://www.w3.org/TR/2012/WD-webdriver-20120710/
      .keys(['\uE013', '\uE006'])
      .waitForElementNotPresent('.spinner', waitTime)
      .waitForElementPresent('div[data-id="document_1"]', waitTime)
      .end();
  }
};
