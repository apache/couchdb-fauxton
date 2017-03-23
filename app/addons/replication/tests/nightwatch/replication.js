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



const helpers = require('../../../../../test/nightwatch_tests/helpers/helpers.js');
const newDatabaseName1 = 'fauxton-selenium-tests-replication1';
const newDatabaseName2 = 'fauxton-selenium-tests-replication2';
const replicatedDBName = 'replicated-db';
const docName1 = 'doc-name1';
const docName2 = 'doc-name2';

const destroyDBsAndCreateReplicator = (client, done) => {
  var nano = helpers.getNanoInstance(client.globals.test_settings.db_url);
  nano.db.destroy(newDatabaseName1, () => {
    nano.db.destroy(newDatabaseName2, () => {
      nano.db.destroy(replicatedDBName, () => {
        nano.db.create('_replicator', function () {
          done();
        });
      });
    });
  });
};

module.exports = {
  before: destroyDBsAndCreateReplicator,

  'Replicates existing local db to new local db' : function (client) {
    const waitTime = client.globals.maxWaitTime;
    const baseUrl = client.globals.test_settings.launch_url;
    const password = client.globals.test_settings.password;
    console.log('PASSWORD', password);

    client
      .createDatabase(newDatabaseName1)
      .checkForDatabaseCreated(newDatabaseName1, waitTime)
      .createDocument(docName1, newDatabaseName1)
      .loginToGUI()
      .url(baseUrl + '/#/replication/_create')
      .waitForElementVisible('button#replicate', waitTime, true)
      .waitForElementVisible('#replication-source', waitTime, true)

      // select LOCAL as the source
      .clickWhenVisible('#replication-source')
      .keys(['\uE015', '\uE006'])
      .waitForElementVisible('.replication__input-react-select', waitTime, true)

      // enter our source DB
      .setValue('.replication__input-react-select .Select-input input', [newDatabaseName1, client.Keys.ENTER])

      // enter a new target name
      .waitForElementVisible('#replication-target', waitTime, true)
      .clickWhenVisible('option[value="REPLICATION_TARGET_NEW_LOCAL_DATABASE"]')
      .setValue('.replication__new-input', replicatedDBName)

      .clickWhenVisible('#replicate')

      .waitForElementVisible('.enter-password-modal', waitTime, true)
      .setValue('.enter-password-modal .password-modal-input', password)
      .clickWhenVisible('.enter-password-modal button.save')
      .waitForElementNotPresent('.enter-password-modal', waitTime, true)
      .waitForElementNotPresent('.global-notification .fonticon-cancel', waitTime, false)
      .end();
  },


  'Replicates existing local db to existing local db' : function (client) {
    const waitTime = client.globals.maxWaitTime;
    const baseUrl = client.globals.test_settings.launch_url;
    const password = client.globals.test_settings.password;

    client

      // create two databases, each with a single (different) doc
      .createDatabase(newDatabaseName1)
      .checkForDatabaseCreated(newDatabaseName1, waitTime)
      .createDocument(docName1, newDatabaseName1)
      .createDatabase(newDatabaseName2)
      .checkForDatabaseCreated(newDatabaseName2, waitTime)
      .createDocument(docName2, newDatabaseName2)

      // now login and fill in the replication form
      .loginToGUI()
      .url(baseUrl + '/#/replication/_create')
      .waitForElementVisible('button#replicate', waitTime, true)
      .waitForElementVisible('#replication-source', waitTime, true)

      // select the LOCAL db as the source
      .clickWhenVisible('#replication-source')
      .keys(['\uE015', '\uE006'])
      .waitForElementVisible('.replication__input-react-select', waitTime, true)
      .setValue('.replication__input-react-select .Select-input input', [newDatabaseName1, client.Keys.ENTER])

      // select existing local as the target
      .waitForElementVisible('#replication-target', waitTime, true)
      .clickWhenVisible('#replication-target option[value="REPLICATION_TARGET_EXISTING_LOCAL_DATABASE"]')
      .setValue('#replication-target-local .Select-input input', [newDatabaseName2, client.Keys.ENTER])

      .getAttribute('#replicate', 'disabled', function (result) {
        // confirm it's not disabled
        this.assert.equal(result.value, null);
      })
      .clickWhenVisible('#replicate')

      .waitForElementVisible('.enter-password-modal', waitTime, true)
      .setValue('.enter-password-modal input[type="password"]', password)
      .clickWhenVisible('.enter-password-modal button.save')
      .end();
  },

  'Replicates using existing doc id' : function (client) {
    const waitTime = client.globals.maxWaitTime;
    const baseUrl = client.globals.test_settings.launch_url;
    const password = client.globals.test_settings.password;

    const replicatorDoc = {
      _id: 'existing-doc-id',
      source: "http://source-db.com",
      target: "http://target-db.com"
    };

    client
      // create two databases, each with a single (different) doc
      .createDatabase(newDatabaseName1)
      .checkForDatabaseCreated(newDatabaseName1, waitTime)
      .createDocument(docName1, newDatabaseName1)
      .createDatabase(newDatabaseName2)
      .checkForDatabaseCreated(newDatabaseName2, waitTime)
      .createDocument(docName2, newDatabaseName2)
      .deleteDocument(replicatorDoc._id, '_replicator')
      .createDocument(replicatorDoc._id, '_replicator', replicatorDoc)

      // now login and fill in the replication form
      .loginToGUI()
      .url(baseUrl + '/#/replication/_create')
      .waitForElementVisible('button#replicate', waitTime, true)
      .waitForElementVisible('#replication-source', waitTime, true)

      // select the LOCAL db as the source
      .clickWhenVisible('#replication-source')
      .keys(['\uE015', '\uE006'])
      .waitForElementVisible('.replication__input-react-select', waitTime, true)
      .setValue('.replication__input-react-select .Select-input input', [newDatabaseName1, client.Keys.ENTER])

      // select existing local as the target
      .waitForElementVisible('#replication-target', waitTime, true)
      .clickWhenVisible('#replication-target option[value="REPLICATION_TARGET_EXISTING_LOCAL_DATABASE"]')
      .setValue('#replication-target-local .Select-input input', [newDatabaseName2, client.Keys.ENTER])
      .setValue('.replication__doc-name-input', [replicatorDoc._id, client.Keys.ENTER])

      .getAttribute('#replicate', 'disabled', function (result) {
        // confirm it's not disabled
        this.assert.equal(result.value, null);
      })
      .clickWhenVisible('#replicate')

      .waitForElementVisible('.replication__error-doc-modal .replication__error-continue', waitTime, true)
      .clickWhenVisible('.replication__error-doc-modal .replication__error-continue')
      .waitForElementVisible('.enter-password-modal', waitTime, true)
      .setValue('.enter-password-modal input[type="password"]', password)
      .clickWhenVisible('.enter-password-modal button.save')
      .end();
  }
};
