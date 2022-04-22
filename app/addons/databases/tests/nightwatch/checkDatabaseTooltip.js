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
  'Check the tooltip icon for DB with deleted items appears': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName = 'TemporaryDoc';

    client
      // use nano to quickly set up a DB with a single doc
      .deleteDatabase(newDatabaseName)
      .createDatabase(newDatabaseName)
      .createDocument(newDocumentName, newDatabaseName)

      .loginToGUI()

      // delete the document manually. This'll ensure the database page has at least one "!" icon
      .clickWhenVisible('#dashboard-content a[href="database/' + newDatabaseName + '/_all_docs"]', waitTime, false)

      //this opens the alternative header
      .clickWhenVisible('.tableview-checkbox-cell input[type="checkbox"]')
      .clickWhenVisible('.bulk-action-component-selector-group button.fonticon-trash', waitTime, false)
      .acceptAlert()
      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--info', waitTime, false)

      .checkForStringPresent(newDatabaseName, '"doc_del_count":1')

      .clickWhenVisible('#primary-navbar a[href="#/_all_dbs"]')
      // now let's look at the actual UI to confirm the tooltip appears
      .waitForElementPresent('.js-db-graveyard', waitTime, false)
      .moveToElement('.js-db-graveyard', 1, 1)

      // confirm the tooltip element has been inserted
      .waitForElementPresent('.tooltip.fade.top.in', waitTime, false)
      .end();
  }
};
