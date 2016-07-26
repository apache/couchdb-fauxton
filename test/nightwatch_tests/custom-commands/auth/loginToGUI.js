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

exports.command = function () {

  var client = this,
      waitTime = client.globals.maxWaitTime,
      baseUrl = client.globals.test_settings.launch_url,
      username = client.globals.test_settings.fauxton_username,
      password = client.globals.test_settings.password;

  client
    .url(baseUrl + '/#login')
    .waitForElementPresent('a[href="#login"]', waitTime, false)
    .click('a[href="#login"]')
    .waitForElementVisible('.couch-login-wrapper', waitTime, false)
    .waitForElementVisible('#username', waitTime, false)
    .setValue('.couch-login-wrapper #username', [username])

    .waitForElementVisible('#password', waitTime, false)
    .setValue('.couch-login-wrapper #password', [password])

    .clickWhenVisible('#submit')

    .closeNotification()
    .waitForElementPresent('[data-name="jump-to-db"]', waitTime, false)

    // important! wait for the db page to fully load. This was the cause of many bugs
    .waitForElementVisible('#dashboard-content table.databases', waitTime, false);


  return this;
};
