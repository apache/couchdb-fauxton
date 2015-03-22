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

function CreateDocument () {
  events.EventEmitter.call(this);
}

// inherit from node's event emitter
util.inherits(CreateDocument, events.EventEmitter);

CreateDocument.prototype.command = function (documentName, databaseName, docContents) {
  var that = this,
      nano = helpers.getNanoInstance(),
      database = nano.use(databaseName);

  if (docContents === undefined) {
    docContents = { dummyKey: "testingValue" };
  }

  database.insert(docContents, documentName, function (err, body, header) {

    if (err) {
      console.log('Error in nano CreateDocument Function: ' + documentName + ', in database: ' + databaseName, err.message);
    }
    console.log('nano  - created a doc: ' + documentName + ', in database: ' + databaseName);
    that.emit('complete');
  });

  return this;
};

module.exports = CreateDocument;
