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
  'Highlight Sidebar' : function (client) {
    var waitTime = client.globals.maxWaitTime,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .url(baseUrl)
      .waitForElementPresent('#add-new-database', waitTime, false)
      .click('a[href="#/replication"]')
      .pause(1000)
      .waitForElementVisible('#replication', waitTime, false)
      .assert.cssClassPresent('li[data-nav-name="Replication"]', 'active')
    .end();
  }
};
