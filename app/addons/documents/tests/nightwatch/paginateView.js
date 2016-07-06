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
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()

      // wait for the db page to fully load
      .waitForElementVisible('#dashboard-content table.databases', waitTime, false)

      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/keyview/_view/keyview')

      .waitForElementPresent('.control-toggle-queryoptions', waitTime, false)

      // ensure the page content has loaded
      .waitForElementPresent('.prettyprint', waitTime, false)

      .waitForElementPresent('#select-per-page', waitTime, false)
      .clickWhenVisible('#select-per-page', waitTime, false)

      // hack to get select working by clicking on it and using keyboard to select
      // http://www.w3.org/TR/2012/WD-webdriver-20120710/
      .keys(['\uE013', '\uE006'])
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('div[data-id="document_9"]', waitTime)
      .execute(function () {
        return $('.doc-row').length;
      }, function (result) {
        client.assert.equal(result.value, 10);
      })
      .end();
  },

  'paginate to page two and back': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()

      // wait for the db page to fully load
      .waitForElementVisible('#dashboard-content table.databases', waitTime, false)

      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/keyview/_view/keyview')
      .waitForElementPresent('.control-toggle-queryoptions', waitTime, false)

      // ensure the page content has loaded
      .waitForElementPresent('.prettyprint', waitTime, false)

      .clickWhenVisible('#select-per-page', waitTime, false)

      // http://www.w3.org/TR/2012/WD-webdriver-20120710/
      .keys(['\uE013', '\uE006'])
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementPresent('#next', waitTime, false)
      .clickWhenVisible('#next', waitTime, false)
      .waitForElementNotPresent('div[data-id="document_1"]', waitTime)
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementPresent('div[data-id="document_19"]', waitTime)
      .clickWhenVisible('#previous', waitTime, false)
      .waitForElementNotPresent('div[data-id="document_19"]', waitTime)
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementPresent('div[data-id="document_1"]', waitTime)
      .end();
  },

  'PerPage change resets to page 1': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()

      // wait for the db page to fully load
      .waitForElementVisible('#dashboard-content table.databases', waitTime, false)

      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/keyview/_view/keyview')
      .waitForElementPresent('.control-toggle-queryoptions', waitTime, false)

      // ensure the page content has loaded
      .waitForElementPresent('.prettyprint', waitTime, false)
      .clickWhenVisible('#select-per-page', waitTime, false)

      // http://www.w3.org/TR/2012/WD-webdriver-20120710/
      .keys(['\uE013', '\uE006'])
      .waitForElementNotPresent('.loading-lines', waitTime, false)

      .clickWhenVisible('#next', waitTime, false)
      .waitForElementNotPresent('div[data-id="document_1"]', waitTime)
      .waitForElementNotPresent('.loading-lines', waitTime, false)

      .clickWhenVisible('#select-per-page', waitTime, false)
      // http://www.w3.org/TR/2012/WD-webdriver-20120710/
      .keys(['\uE013', '\uE006'])

      .waitForElementPresent('div[data-id="document_1"]', waitTime)
      .end();
  }
};
