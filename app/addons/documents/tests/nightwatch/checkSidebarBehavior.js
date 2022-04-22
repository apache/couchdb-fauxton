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

  'Checks if design docs that have special chars in the ID show up in the UI and are clickable': function (client) {
    const waitTime = 10000,
          newDatabaseName = client.globals.testDatabaseName,
          baseUrl = client.options.launch_url;
    const docNormal = 'ddoc_normal';
    const docSpecialChars = 'ddoc_with.$pecialcharacters()+-';
    const docSpecialCharsEncoded = 'ddoc_with.%24pecialcharacters()%2B-';
    client
      .loginToGUI()
      .createDocument('_design/' + docNormal, newDatabaseName)
      .createDocument('_design/' + docSpecialChars, newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.nav-list', waitTime, false)
      // Verify 'Metadata' subitem is not visible
      .assert.not.visible('a[href="#/database/' + newDatabaseName + '/_design/' + docNormal + '/_info"]')
      .assert.not.visible('a[href="#/database/' + newDatabaseName + '/_design/' + docSpecialCharsEncoded + '/_info"]')
      // Click sidebar items and verify they expand
      .clickWhenVisible('#nav-header-' + docNormal)
      .assert.visible('a[href="#/database/' + newDatabaseName + '/_design/' + docNormal + '/_info"]')
      .clickWhenVisible('span[title="_design/' + docSpecialChars + '"]')
      .assert.visible('a[href="#/database/' + newDatabaseName + '/_design/' + docSpecialCharsEncoded + '/_info"]')
      // Verify display name is not encoded
      .assert.textContains('span[title="_design/' + docSpecialChars + '"]', docSpecialChars)
      .end();
  }
};
