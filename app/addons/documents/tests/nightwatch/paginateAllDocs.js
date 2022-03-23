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
        baseUrl = client.options.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('.fonticon-json')
      // ensures the main body (results list) has been rendered
      .waitForElementPresent('.prettyprint', waitTime, false)
      .clickWhenVisible('select[id="select-per-page"] option[value="10"]')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('div[data-id="document_16"]', waitTime)
      .waitForElementPresent('.doc-row', waitTime, false)
      .execute(function () {
        return document.querySelectorAll('.doc-row').length;
      }, function (result) {
        client.assert.equal(result.value, 10);
      })
      .end();
  },

  'paginate to page two and back': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .clickWhenVisible('.fonticon-json')
      .waitForElementNotPresent('.loading-lines', waitTime, false)

      // ensures the main body (results list) has been rendered
      .waitForElementPresent('.prettyprint', waitTime, false)

      .clickWhenVisible('select[id="select-per-page"] option[value="10"]')

      .waitForElementNotPresent('.loading-lines', waitTime, false)
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
        baseUrl = client.options.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .clickWhenVisible('.fonticon-json')
      .waitForElementNotPresent('.loading-lines', waitTime, false)

      // ensures the main body (results list) has been rendered
      .waitForElementPresent('.prettyprint', waitTime, false)
      // moving from '20'
      .clickWhenVisible('select[id="select-per-page"] option[value="10"]')

      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementNotPresent('div[data-id="document_16"]', waitTime)
      .clickWhenVisible('#next', waitTime, false)
      .waitForElementPresent('div[data-id="document_17"]', waitTime)
      .clickWhenVisible('#select-per-page', waitTime, false)
      // moving from '10'
      .clickWhenVisible('select[id="select-per-page"] option[value="5"]')

      .waitForElementPresent('div[data-id="document_1"]', waitTime)
      .end();
  },

  'paginate to page two and switch to json view': function (client) {
    /*jshint multistr: true */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementNotPresent('.loading-lines', waitTime, false)

      // ensures the main body (results list) has been rendered
      .waitForElementPresent('.table-view-docs', waitTime)

      .clickWhenVisible('#select-per-page', waitTime, false)
      // http://www.w3.org/TR/2012/WD-webdriver-20120710/
      // moving from '20'
      .clickWhenVisible('select[id="select-per-page"] option[value="10"]')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementNotPresent('td[title="document_16"]', waitTime)
      .clickWhenVisible('#next', waitTime, false)
      .waitForElementPresent('td[title="document_17"]', waitTime)

      .clickWhenVisible('.fonticon-json')
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementPresent('div[data-id="document_17"]', waitTime)
      .clickWhenVisible('#previous', waitTime, false)
      .waitForElementPresent('div[data-id="document_1"]', waitTime)
      .end();
  },
};
