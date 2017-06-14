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
  'it updates the API url even for routes in the same routeobject' : function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_find')
      .waitForElementVisible('.faux__jsonlink-link', waitTime, false)
      .assert.attributeContains('.faux__jsonlink-link', 'href', newDatabaseName + '/_find')
      .clickWhenVisible('.edit-link')
      .waitForElementVisible('.prettyprint', waitTime, false)
      .waitForElementVisible('.faux__jsonlink-link', waitTime, false)
      .assert.attributeContains('.faux__jsonlink-link', 'href', newDatabaseName + '/_index')
      .end();
  }
};
