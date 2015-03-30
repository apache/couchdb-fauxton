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

  'Checks if design docs that have a dot symbol in the id show up in the UI': function (client) {
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        designPrefix = '_design/',
        newDocumentName1 = 'ddoc_normal',
        newDocumentName2 = 'ddoc.with.specialcharacters',
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .createDocument(designPrefix + newDocumentName1, newDatabaseName)
      .createDocument(designPrefix + newDocumentName2, newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')
      .clickWhenVisible('#nav-header-' + newDocumentName1.replace(/\./g, '\\.'))
      .clickWhenVisible('#nav-header-' + newDocumentName2.replace(/\./g, '\\.'))
      .waitForElementPresent('#' + newDocumentName2.replace(/%/g, '_percent_').replace(/\./g, '_dot_'), waitTime, false)
    .end();
  }
};
