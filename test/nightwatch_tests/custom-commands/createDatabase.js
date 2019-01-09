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

var util = require('util'),
    events = require('events'),
    helpers = require('../helpers/helpers.js');

const commandHelper = require('./helper.js');
const checkForDatabaseCreated = commandHelper.checkForDatabaseCreated;

function CreateDatabase () {
  events.EventEmitter.call(this);
}

// inherit from node's event emitter
util.inherits(CreateDatabase, events.EventEmitter);

CreateDatabase.prototype.command = function (databaseName) {
  const nano = helpers.getNanoInstance(this.client.options.db_url);


  nano.db.create(databaseName).then(() => {
    console.log('nano - created a database: ' + databaseName);
    const timeout = helpers.maxWaitTime;
    const couchUrl = this.client.options.db_url;

    checkForDatabaseCreated(couchUrl, databaseName, timeout, () => {
      this.emit('complete');
    });
  }).catch(err => {
    console.log('Error in CreateDatabase custom command. Db: ' + databaseName, 'Reason:', err.message);
    this.emit('complete');
  });

  return this;
};

module.exports = CreateDatabase;
