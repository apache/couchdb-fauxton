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

  'Can view doc': client => {
    const waitTime = client.globals.maxWaitTime;
    const baseUrl = client.options.launch_url;

    const replicatorDoc = {
      _id: 'existing-doc-id-view-doc',
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
      .clickWhenVisible('a[href="#/database/_replicator/existing-doc-id-view-doc"]')
      .waitForElementNotPresent('.load-lines', waitTime, true)
      .waitForElementPresent('#editor-container', waitTime, true)
      .end();
  },

  'Can edit doc': client => {
    const waitTime = client.globals.maxWaitTime;
    const baseUrl = client.options.launch_url;

    const replicatorDoc = {
      _id: 'existing-doc-id-edit-doc',
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
      .clickWhenVisible('a[title="Edit replication"]')
      .waitForElementNotPresent('.load-lines', waitTime, true)
      .waitForElementPresent('.replication__section', waitTime, true)
      .pause(10000)
      .assert.valueContains(".replication__doc-name-input", replicatorDoc._id)
      .end();
  },

  'Can filter docs': client => {
    const waitTime = client.globals.maxWaitTime;
    const baseUrl = client.options.launch_url;

    const replicatorDoc1 = {
      _id: 'existing-doc-id-filter1',
      source: "http://source-db.com",
      target: "http://target-db.com"
    };

    const replicatorDoc2 = {
      _id: 'existing-doc-filter2',
      source: "http://source-db2.com",
      target: "http://target-db.com"
    };
    client
      .deleteDatabase('_replicator')
      .createDatabase('_replicator')
      .createDocument(replicatorDoc1._id, '_replicator', replicatorDoc1)
      .createDocument(replicatorDoc2._id, '_replicator', replicatorDoc2)
      .loginToGUI()
      .url(baseUrl + '/#replication')
      .waitForElementNotPresent('.load-lines', waitTime, true)
      .waitForElementVisible('.replication__filter-input', waitTime, true)
      .setValue('.replication__filter-input', 'filter1')
      .waitForElementNotPresent('a[href="#/database/_replicator/existing-doc-filter2"]', waitTime, true)
      .clearValue('.replication__filter-input')
      .setValue('.replication__filter-input', 'filter')
      .waitForElementPresent('a[href="#/database/_replicator/existing-doc-filter2"]', waitTime, true)
      .end();
  },

  "Action click doesn't change doc's order": client =>{
    const waitTime = client.globals.maxWaitTime;
    const baseUrl = client.options.launch_url;
    const firstRowSelector = '.replication__table-row:nth-of-type(1)';
    let firstDoc;

    const replicatorDoc1 = {
      _id: 'existing-doc-id-filter1',
      source: "http://source-db.com",
      target: "http://target-db.com"
    };

    const replicatorDoc2 = {
      _id: 'existing-doc-filter2',
      source: "http://source-db2.com",
      target: "http://target-db.com"
    };
    client
      .deleteDatabase('_replicator')
      .createDatabase('_replicator')
      .createDocument(replicatorDoc1._id, '_replicator', replicatorDoc1)
      .createDocument(replicatorDoc2._id, '_replicator', replicatorDoc2)
      .loginToGUI()
      .url(baseUrl + '/#replication')
      .waitForElementNotPresent('.load-lines', waitTime, true)
      .waitForElementVisible(firstRowSelector, waitTime, true)
      .getText(firstRowSelector + ' td:nth-of-type(2)', function(result) {
        firstDoc = result.value;
      })
      .clickWhenVisible(firstRowSelector + ' .replication__row-btn.icon-trash', waitTime, true)
      .clickWhenVisible('.replication_delete-doc-modal.modal-dialog .modal-footer .cancel-link', waitTime, true)
      .waitForElementVisible(firstRowSelector, waitTime, true)
      .getText(firstRowSelector + ' td:nth-of-type(2)', function(result) {
        this.verify.ok(result.value === firstDoc,
          'Checking if the order was reserved if no documents were sorted');
      })
      .end();
  },

  "Change number of replications displayed": client =>{
    const waitTime = client.globals.maxWaitTime;
    const baseUrl = client.options.launch_url;

    const replicatorDoc1 = {
      _id: 'existing-doc-id-display',
      source: "http://source-db.com",
      target: "http://target-db.com"
    };

    const replicatorDoc2 = {
      _id: 'existing-doc-id-display2',
      source: "http://source-db2.com",
      target: "http://target-db.com"
    };

    const replicatorDoc3 = {
      _id: 'existing-doc-id-display3',
      source: "http://source-db3.com",
      target: "http://target-db.com"
    };

    const replicatorDoc4 = {
      _id: 'existing-doc-id-display4',
      source: "http://source-db4.com",
      target: "http://target-db.com"
    };

    const replicatorDoc5 = {
      _id: 'existing-doc-id-display5',
      source: "http://source-db5.com",
      target: "http://target-db.com"
    };

    const replicatorDoc6 = {
      _id: 'existing-doc-id-display6',
      source: "http://source-db6.com",
      target: "http://target-db.com"
    };

    client
      .deleteDatabase('_replicator')
      .createDatabase('_replicator')
      .createDocument(replicatorDoc1._id, '_replicator', replicatorDoc1)
      .createDocument(replicatorDoc2._id, '_replicator', replicatorDoc2)
      .createDocument(replicatorDoc3._id, '_replicator', replicatorDoc3)
      .createDocument(replicatorDoc4._id, '_replicator', replicatorDoc4)
      .createDocument(replicatorDoc5._id, '_replicator', replicatorDoc5)
      .createDocument(replicatorDoc6._id, '_replicator', replicatorDoc6)
      .loginToGUI()
      .url(baseUrl + '/#replication')
      .waitForElementNotPresent('.load-lines', waitTime, true)
      .waitForElementPresent('.replication__table-row', waitTime, true)
      .getText('.current-replications', function(result) {
        this.verify.ok(result.value === "Showing replications 1 - 6");
      })
      .assert.elementsCount('.replication__table-row', 6)
      .clickWhenVisible('select[id="select-per-page"] option[value="5"]')
      .waitForElementNotPresent('.load-lines', waitTime, true)
      .waitForElementPresent('.replication__table-row', waitTime, true)
      .getText('.current-replications', function(result) {
        this.verify.ok(result.value === "Showing replications 1 - 5");
      })
      .assert.elementsCount('.replication__table-row', 5)
      .clickWhenVisible('select[id="select-per-page"] option[value="25"]')
      .waitForElementNotPresent('.load-lines', waitTime, true)
      .waitForElementPresent('.replication__table-row', waitTime, true)
      .getText('.current-replications', function(result) {
        this.verify.ok(result.value === "Showing replications 1 - 6");
      })
      .assert.elementsCount('.replication__table-row', 6)
      .end();
  }
};
