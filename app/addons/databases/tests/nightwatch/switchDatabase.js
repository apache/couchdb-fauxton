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

const {Key} = require('selenium-webdriver');

module.exports = {
  'Confirm selecting database via typeahead redirects properly': function (client) {
    const waitTime = client.globals.maxWaitTime;
    const newDatabaseName = client.globals.testDatabaseName;

    client
      .createDatabase(newDatabaseName)
      .loginToGUI()

      // wait for the footer bar to appear (not strictly necessary, but ensures it shows up)
      .waitForElementPresent('.faux__onepane-footer .pagination-footer', waitTime, false)
      .getCssProperty('.faux__onepane-footer', 'bottom', function (result) {
        this.assert.equal(result.value, '0px');
      })
      // wait for the DB name typeahead field to appear in the header
      .waitForElementPresent('[data-name="jump-to-db"]', waitTime, false)
      .waitForElementPresent('#dashboard-content table.databases', waitTime, false)
      .clickWhenVisible('[data-name="jump-to-db"] .Select-placeholder')
      .setValue('[data-name="jump-to-db"] input', [newDatabaseName])
      .waitForElementPresent('.Select-option', waitTime, false)
      .perform(function() {
        const actions = this.actions({async: true});
        return actions
          .sendKeys(Key.ENTER);
      })
      .waitForElementPresent('.index-pagination', waitTime, false)
      // now check we've redirected and the URL ends with /_all_docs
      .url((result) => {
        const urlEndsWithAllDocs = /all_docs$/.test(result.value);
        client.assert.ok(urlEndsWithAllDocs, 'Redirected properly');
      })
      .end();
  }
};
