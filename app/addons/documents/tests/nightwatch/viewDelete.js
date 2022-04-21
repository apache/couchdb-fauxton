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

  'Deletes a view': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.options.launch_url;

    client
      .createDatabase(newDatabaseName)
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/testdesigndoc/_view/stubview')
      .clickWhenVisible('.fonticon-json')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .assert.textContains('.prettyprint', 'stub')

      // confirm the sidebar shows the testdesigndoc design doc
      .waitForElementVisible('#design-doc-menu-testdesigndoc', waitTime, true)

      .clickWhenVisible('.index-list .active span', waitTime, true)
      .clickWhenVisible('.popover-content .fonticon-trash', waitTime, true)
      .clickWhenVisible('.confirmation-modal button.btn-primary', waitTime, true)
      .waitForElementNotPresent('.confirmation-modal button.btn-primary', waitTime, true)

      // now wait for the sidebar to have removed the design doc
      .waitForElementNotPresent('#testdesigndoc', waitTime, true)
      .end();
  }
};
