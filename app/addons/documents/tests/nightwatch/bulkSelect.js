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
  // When I select all documents
  // And there are less documents than I have set to display per page
  // Then I want the select-all-button to be selected
  'Bulk Documents: selector': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName1 = 'bulktest1',
        newDocumentName2 = 'bulktest2',
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .createDocument(newDocumentName1, newDatabaseName)
      .createDocument(newDocumentName2, newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('.control-toggle-alternative-header')
      .clickWhenVisible('.control-select-all')
      .assert.attributeEquals('.control-select-all', 'disabled', 'true')
      .end();
  }
};
