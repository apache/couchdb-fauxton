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

  'Can delete document': (client) => {
    const waitTime = client.globals.maxWaitTime;
    const baseUrl = client.globals.test_settings.launch_url;
    const password = client.globals.test_settings.password;

    const replicatorDoc = {
      _id: 'existing-doc-id-2',
      source: "http://source-db.com",
      target: "http://target-db.com"
    };
    client
      .deleteDatabase('_replicator')
      .createDatabase('_replicator')
      .createDocument(replicatorDoc._id, '_replicator', replicatorDoc)
      .loginToGUI()
      .url(baseUrl + '/#replication')
      .waitForElementNotPresent('.load-lines', waitTime, true)
      .waitForElementPresent('.replication__filter', waitTime, true)
      .click('a[title="Delete document existing-doc-id-2"]')
      .waitForElementPresent('.replication_delete-doc-modal', waitTime, true)
      .click('.replication_delete-doc-modal button.save')
      .waitForElementNotPresent('.replication_delete-doc-modal', waitTime, true)
      .waitForElementNotPresent('.global-notification .fonticon-cancel', waitTime, false)
      .waitForElementNotPresent('.load-lines', waitTime, true)
      .waitForElementNotPresent('a[title="Delete document existing-doc-id-2"]', waitTime, true)
      .assert.elementNotPresent('a[title="Delete document existing-doc-id-2"]')
      .end();
  }
};
