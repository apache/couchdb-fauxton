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

  'Expand/Collapse works on documents': function (client) {
    var waitTime = 10000,
      newDatabaseName = client.globals.testDatabaseName,
      baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .createDocument('doc 1', newDatabaseName)
      .createDocument('doc 2', newDatabaseName)
      .createDocument('doc 3', newDatabaseName)
      .createDocument('doc 4', newDatabaseName)
      .createDocument('doc 5', newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementVisible('#collapse', waitTime, false)

      // confirm all rows are expanded by default (more elegant way to do this?)
      .source(function (result) {
        var numExpandedDocs = result.value.match(/doc-data/g).length;
        this.verify.ok(numExpandedDocs === 5, 'Checking there are 5 expanded rows');
      })

      // now toggle the items and confirm there are NO expanded items
      .click('#collapse')
      .waitForElementNotPresent('.doc-data', waitTime, false)

      // lastly, expand a single one and confirm there's only one that's been expanded
      .click('.label-checkbox-doclist')
      .click('#collapse')
      .waitForElementPresent('.doc-data', waitTime, false)
      .source(function (result) {
        var numExpandedDocs = result.value.match(/doc-data/g).length;
        this.verify.ok(numExpandedDocs === 1, 'Checking there is 1 expanded row');
      })
      .end();
  }
};
