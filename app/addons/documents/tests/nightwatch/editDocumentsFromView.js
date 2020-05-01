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
  'Edit is allowed from default Map Views' : function (client) {
    const waitTime = client.globals.maxWaitTime,
          newDatabaseName = client.globals.testDatabaseName,
          baseUrl = client.options.launch_url,
          newDocumentName = '_design/abc',
          ddocContents = {
            "views": {
              "evens": {
                "map": "function (doc) { if (doc.number%2 === 0) { emit(doc._id, doc.number); } }",
                "reduce" : "_count"
              }
            },
            "language": "javascript"
          };
    client
      .createDocument(newDocumentName, newDatabaseName, ddocContents)
      .populateDatabase(newDatabaseName)

      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/abc/_view/evens')
      .clickWhenVisible('.fonticon-json')

      //navigate to 'evens' view (declared above), then click on first document's pencil icon
      .clickWhenVisible('a[href="#/database/' + newDatabaseName + '/document_10"]')
      //navigated to editor
      .waitForElementVisible('#editor-container', waitTime, false)
      .verify.urlContains('#/database/' + newDatabaseName + '/document_10');
  },

  'Edit is not allowed for Map Views where reduce is checked' : function (client) {
    const waitTime = client.globals.maxWaitTime;
    const baseUrl = client.options.launch_url;
    const newDatabaseName = client.globals.testDatabaseName;

    client
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/abc/_view/evens')
      .clickWhenVisible('.control-toggle-queryoptions')
      .clickWhenVisible('#query-options-tray label[for="qoReduce"]')
      .clickWhenVisible('#button-options button[type="submit"]')
      .waitForElementNotPresent('i.fonticon-pencil', waitTime)
      .end();
  }
};
