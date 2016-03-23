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

function CreateManyDocuments () {
  events.EventEmitter.call(this);
}

// inherit from node's event emitter
util.inherits(CreateManyDocuments, events.EventEmitter);

CreateManyDocuments.prototype.command = function (amount, databaseName) {
  var that = this,
      nano = helpers.getNanoInstance(this.client.options.db_url),
      database = nano.use(databaseName),
      docs = [];

  for (var i = 0; i < 100; i++) {
    docs.push({"_id": "" + i, "dummyKey": "testingValue"});
  }

  database.bulk({docs: docs}, function (err, body, header) {
    if (err) {
      throw err;
    }
    that.emit('complete');
  });

  return this;
};

module.exports = CreateManyDocuments;
