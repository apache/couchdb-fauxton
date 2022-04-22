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

  '@tags': ['couchdb-v2-only'],

  'lists databases with a 401' : function (client) {
    const waitTime = client.globals.maxWaitTime;

    const userDoc = {
      "_id": "org.couchdb.user:furbie",
      "name": "furbie",
      "type": "user",
      "roles": [],
      "password": "furbie"
    };

    client
      .createDocument('org.couchdb.user:furbie', '_users', userDoc)
      .loginToGUI('furbie', 'furbie')

      .waitForElementVisible('.database-load-fail', waitTime, false)
      .waitForElementVisible('[data-name="database-load-fail-name"]', waitTime, false)
      .assert.textContains('[data-name="database-load-fail-name"]', '_global_changes')

      .end();
  }
};
