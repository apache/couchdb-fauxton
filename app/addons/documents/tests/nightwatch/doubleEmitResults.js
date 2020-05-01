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

  'View results with same id are all shown': function (client) {
    var waitTime = client.globals.maxWaitTime;
    var newDatabaseName = client.globals.testDatabaseName;
    var baseUrl = client.options.launch_url;

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview')
      .clickWhenVisible('.fonticon-json')
      .waitForElementPresent('.clearfix', waitTime, false)
      .waitForElementPresent('.doc-row', waitTime, false)
      .execute(function () {
        return document.querySelectorAll('.doc-row').length;
      }, function (result) {
        client.assert.equal(result.value, 20);
      })
      .end();
  },
};
