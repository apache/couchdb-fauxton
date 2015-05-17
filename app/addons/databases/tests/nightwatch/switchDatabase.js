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
  'Confirm selecting database via typeahead redirects properly': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName;

    client
      .createDatabase(newDatabaseName)
      .loginToGUI()

      // wait for the DB name typeahead field to appear in the header
      .waitForElementPresent('#jump-to-db .search-autocomplete', waitTime, false)
      .waitForElementPresent('#dashboard-content table.databases', waitTime, false)
      .setValue('#jump-to-db .search-autocomplete', [newDatabaseName, client.Keys.ENTER])
      .waitForElementPresent('.index-pagination', waitTime, false)
      // now check we've redirected and the URL ends with /_all_docs
      .url(function (result) {
        var endsWithAllDocs = /all_docs$/.test(result.value);
        this.assert.ok(endsWithAllDocs, 'Redirected properly');
      })
      .end();
  }
};
