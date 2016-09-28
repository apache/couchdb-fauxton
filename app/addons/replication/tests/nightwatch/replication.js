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
const pwd = 'testerpass';
const longWaitTime = 120000;

const destroyDBs = (client, done) => {
  var nano = helpers.getNanoInstance(client.globals.test_settings.db_url);
  nano.db.destroy(newDatabaseName1, () => {
    nano.db.destroy(newDatabaseName2, () => {
      nano.db.destroy(replicatedDBName, () => {
        done();
      });
    });
  });
};

module.exports = {
  before: destroyDBs, // just in case the test failed on prev execution
  after: destroyDBs,

  'Replicates existing local db to new local db' : function (client) {
    var waitTime = client.globals.maxWaitTime,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .createDatabase(newDatabaseName1)
      .checkForDatabaseCreated(newDatabaseName1, longWaitTime)
      .createDocument(docName1, newDatabaseName1)
      .loginToGUI()
      .url(baseUrl + '/#replication')
      .waitForElementPresent('button#replicate', waitTime, true)
      .waitForElementPresent('#replication-source', waitTime, true)

      // select LOCAL as the source
      .click('#replication-source')
      .click('#replication-source option[value="REPLICATION_SOURCE_LOCAL"]')
      .waitForElementPresent('.replication-source-name-row', waitTime, true)

      // enter our source DB
      .setValue('.replication-source-name-row .Select-input input', [newDatabaseName1])
      .keys(['\uE015', '\uE015', '\uE006'])

      // enter a new target name
      .click('#replication-target')
      .click('option[value="REPLICATION_TARGET_NEW_LOCAL_DATABASE"]')
      .setValue('.new-local-db', replicatedDBName)

      .click('#replicate')

      .waitForElementPresent('.enter-password-modal', waitTime, true)
      .setValue('.enter-password-modal input[type="password"]', pwd)
      .click('.enter-password-modal button.save')
      .waitForElementNotPresent('.enter-password-modal', waitTime, true)

      // now check the database was created
      .checkForDatabaseCreated(replicatedDBName, longWaitTime)

      // lastly, check the doc was replicated as well
      .checkForDocumentCreated(docName1, longWaitTime, replicatedDBName)
      .end();
  },


  'Replicates existing local db to existing local db' : function (client) {
    var waitTime = client.globals.maxWaitTime,
      baseUrl = client.globals.test_settings.launch_url;

    client

      // create two databases, each with a single (different) doc
      .createDatabase(newDatabaseName1)
      .checkForDatabaseCreated(newDatabaseName1, longWaitTime)
      .createDocument(docName1, newDatabaseName1)
      .createDatabase(newDatabaseName2)
      .checkForDatabaseCreated(newDatabaseName2, longWaitTime)
      .createDocument(docName2, newDatabaseName2)

      // now login and fill in the replication form
      .loginToGUI()
      .url(baseUrl + '/#replication')
      .waitForElementPresent('button#replicate', waitTime, true)
      .waitForElementPresent('#replication-source', waitTime, true)

      // select the LOCAL db as the source
      .click('#replication-source')
      .click('#replication-source option[value="REPLICATION_SOURCE_LOCAL"]')
      .waitForElementPresent('.replication-source-name-row', waitTime, true)
      .setValue('.replication-source-name-row .Select-input input', [newDatabaseName1])
      .keys(['\uE015', '\uE015', '\uE006'])

      // select existing local as the target
      .click('#replication-target')
      .click('#replication-target option[value="REPLICATION_TARGET_EXISTING_LOCAL_DATABASE"]')
      .setValue('.replication-target-name-row .Select-input input', [newDatabaseName2])
      .keys(['\uE015', '\uE015', '\uE006'])

      .getAttribute('#replicate', 'disabled', function (result) {
        // confirm it's not disabled
        this.assert.equal(result.value, null);
      })
      .click('#replicate')

      .waitForElementPresent('.enter-password-modal', waitTime, true)
      .setValue('.enter-password-modal input[type="password"]', pwd)
      .click('.enter-password-modal button.save')

      // now check the target database contains the doc from the original db
      .checkForDocumentCreated(docName1, longWaitTime, newDatabaseName2)
      .end();
  }
};
