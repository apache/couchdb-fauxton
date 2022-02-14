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
  'Check the documentation page exists': function (client) {
    const waitTime = client.globals.maxWaitTime;

    client
      .loginToGUI()
      .clickWhenVisible('a[href="#/documentation"]')
      .waitForElementVisible('a[href="http://docs.couchdb.org/en/latest/"]', waitTime, false)
      .waitForElementVisible('a[href="./docs/index.html"]', waitTime, false)
      .waitForElementVisible('a[href="http://blog.couchdb.org/"]', waitTime, false)
      .waitForElementVisible('a[href="https://couchdb.apache.org/"]', waitTime, false)
      .waitForElementVisible('a[href="https://github.com/apache/couchdb"]', waitTime, false)
      .waitForElementVisible('a[href="https://github.com/apache/couchdb-fauxton"]', waitTime, false)
      .waitForElementVisible('a[href="https://couchdb.apache.org/fauxton-visual-guide/index.html"]', waitTime, false)
      .waitForElementVisible('a[href="http://www.apache.org/"]', waitTime, false)
      .waitForElementVisible('a[href="https://twitter.com/couchdb"]', waitTime, false)
      .waitForElementVisible('a[href="https://www.linkedin.com/company/apache-couchdb"]', waitTime, false)
      .end();
  }
};
