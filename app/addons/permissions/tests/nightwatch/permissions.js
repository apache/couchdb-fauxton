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

  'CouchDB Database Permissions Test' : (client) => {

    const waitTime = client.globals.maxWaitTime;
    const newDatabaseName = client.globals.testDatabaseName;
    const baseUrl = client.options.launch_url;

    client
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/permissions')

      .waitForElementVisible('div#permissions__admins', waitTime, false)

      .setValue('div#permissions__admins [placeholder="Username"]', 'blergie')
      .clickWhenVisible('div#permissions__admins #form-users-permissions button')

      .waitForElementVisible('.permission-items li', waitTime, false)
      .assert.textContains('.permission-items li span', 'blergie')

      .url(baseUrl + '/#/database/' + newDatabaseName + '/permissions')
      .waitForElementVisible('.permission-items li', waitTime, false)
      .assert.textContains('.permission-items li span', 'blergie')

      .end();
  }
};
