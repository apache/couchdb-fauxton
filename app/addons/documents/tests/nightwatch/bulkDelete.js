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
  'Bulk deletes': function (client) {
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName1 = 'bulktest1',
        newDocumentName2 = 'bulktest2',
        baseUrl = client.globals.baseUrl;

    client
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.all', waitTime, false)
      .click('.all')
      .click('.js-bulk-delete')
      .getText('body', function (result) {
        var data = result.value,
            isPresentFirstDoc = data.indexOf(newDocumentName1) !== -1,
            isPresentSecondDoc = data.indexOf(newDocumentName2) !== -1,
            bothMissing = !isPresentFirstDoc && !isPresentSecondDoc;

        this.verify.ok(bothMissing,
          'Checking if documents were deleted');
      })
      .end();
  }
};
