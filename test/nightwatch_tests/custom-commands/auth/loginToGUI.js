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
      baseUrl = client.globals.test_settings.launch_url,
      username = client.globals.test_settings.fauxton_username,
      password = client.globals.test_settings.password;

  client
    .url(baseUrl+'/#login')
    .waitForElementPresent('a[href="#login"]', 15000, false)
    .click('a[href="#login"]')
    .waitForElementPresent('#username', 10000, false)
    .setValue('#username', [username])
    .setValue('#password', [password, client.Keys.ENTER])
    .closeNotification()
    .waitForElementPresent('#jump-to-db', 10000, false);

  return this;
};
