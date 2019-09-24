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
// the License./
module.exports = {

  'Edits existing search route works': function (client) {
    /*jshint multistr: true */
    const baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .url(baseUrl + '/#database/shared/dashboard-test-account/shareddatabasesrule/_design/for-tests/_search/test-can-edit/edit')
      // wait for the page to fully load
      .waitForElementNotPresent('.loading-lines', client.globals.maxWaitTime, false)
      .waitForElementVisible('#save-index', client.globals.maxWaitTime)
      .end();
  },

  'Create new search route works': function (client) {
    /*jshint multistr: true */
    const baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .url(baseUrl + '/#database/shared/dashboard-test-account/shareddatabasesrule/new_search')
      // wait for the page to fully load
      .waitForElementNotPresent('.loading-lines', client.globals.maxWaitTime, false)
      .waitForElementVisible('#save-index', client.globals.maxWaitTime)
      .end();
  }

};
