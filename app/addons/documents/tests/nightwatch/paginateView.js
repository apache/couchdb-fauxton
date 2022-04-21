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
        baseUrl = client.options.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()

      // wait for the db page to fully load
      .waitForElementVisible('#dashboard-content table.databases', waitTime, false)

      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/keyview/_view/keyview')
      .clickWhenVisible('.fonticon-json')

      .waitForElementPresent('.control-toggle-queryoptions', waitTime, false)

      // ensure the page content has loaded
      .waitForElementPresent('.prettyprint', waitTime, false)

      .waitForElementPresent('#select-per-page', waitTime, false)

      // from '20'
      .clickWhenVisible('select[id="select-per-page"] option[value="10"]')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementNotPresent('div[data-id="document_9"]', waitTime)
      .execute(function () {
        return document.querySelectorAll('.doc-row').length;
      }, function (result) {
        client.assert.equal(result.value, 10);
      })
      .end();
  },

  'paginate to page two and back': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()

      // wait for the db page to fully load
      .waitForElementVisible('#dashboard-content table.databases', waitTime, false)

      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/keyview/_view/keyview')
      .clickWhenVisible('.fonticon-json')
      .waitForElementPresent('.control-toggle-queryoptions', waitTime, false)

      // ensure the page content has loaded
      .waitForElementPresent('.prettyprint', waitTime, false)

      // from '20'
      .clickWhenVisible('select[id="select-per-page"] option[value="10"]')

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
        baseUrl = client.options.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()

      // wait for the db page to fully load
      .waitForElementVisible('#dashboard-content table.databases', waitTime, false)

      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/keyview/_view/keyview')
      .clickWhenVisible('.fonticon-json')
      .waitForElementPresent('.control-toggle-queryoptions', waitTime, false)

      // ensure the page content has loaded
      .waitForElementPresent('.prettyprint', waitTime, false)
      // from '20'
      .clickWhenVisible('select[id="select-per-page"] option[value="10"]')
      .waitForElementNotPresent('.loading-lines', waitTime, false)

      .clickWhenVisible('#next', waitTime, false)
      .waitForElementNotPresent('div[data-id="document_1"]', waitTime)
      .waitForElementNotPresent('.loading-lines', waitTime, false)

      // from '10'
      .clickWhenVisible('select[id="select-per-page"] option[value="5"]')

      .waitForElementPresent('div[data-id="document_1"]', waitTime)
      .end();
  },

  'paginate to page two and switch to json view': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()

      // wait for the db page to fully load
      .waitForElementVisible('#dashboard-content table.databases', waitTime, false)

      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/keyview/_view/keyview')
      .waitForElementPresent('.control-toggle-queryoptions', waitTime, false)

      // ensure the page content has loaded
      .waitForElementPresent('.table-view-docs', waitTime)

      // from '20'
      .clickWhenVisible('select[id="select-per-page"] option[value="10"]')

      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementPresent('#next', waitTime, false)
      .clickWhenVisible('#next', waitTime, false)
      .waitForElementNotPresent('td[title="document_1"]', waitTime)
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementPresent('td[title="document_19"]', waitTime)

      .clickWhenVisible('.fonticon-json')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .waitForElementPresent('div[data-id="document_19"]', waitTime)
      .clickWhenVisible('#previous', waitTime, false)
      .waitForElementNotPresent('div[data-id="document_19"]', waitTime)
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .waitForElementPresent('div[data-id="document_1"]', waitTime)
      .end();
  },
};
