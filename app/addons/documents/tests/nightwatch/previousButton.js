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
  'View: Navigate previous navigates to _all_docs': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName, 3)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_changes')
      .clickWhenVisible('#nav-header-keyview')
      .clickWhenVisible('#nav-design-function-keyviewviews a')
      .clickWhenVisible('#keyview_keyview')
      .clickWhenVisible('.breadcrumb-back-link .fonticon-left-open')
      .assert.urlContains('_all_docs')
    .end();
  },

  'Mango: Navigate back to _all_docs': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName, 3)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_index')
      .clickWhenVisible('.breadcrumb-back-link .fonticon-left-open')
      .assert.urlContains('_all_docs')
    .end();
  }
};
