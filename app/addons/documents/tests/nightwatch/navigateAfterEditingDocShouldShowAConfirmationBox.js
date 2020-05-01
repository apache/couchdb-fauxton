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

  'Navigate to New Doc Page, editing and then clicking on the sidebar should show a confirmation dialog': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    var newLink = '#/database/' + newDatabaseName + '/_new';

    client
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('#new-all-docs-button a')
      .clickWhenVisible('#new-all-docs-button a[href="' + newLink + '"]')
      .waitForElementPresent('.code-region', waitTime, false)
      .verify.urlEquals(baseUrl + '/' + newLink)

      .keys(['.ace_variable', 'v'])
      .clickWhenVisible('a[href="#/activetasks"]')
      .acceptAlert()
      .verify.urlEquals(baseUrl + '/#/activetasks');
  }
};
