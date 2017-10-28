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
    helpers = require('../helpers/helpers.js'),
    request = require('request');

const commandHelper = require('./helper.js');
const checkForDocumentCreated = commandHelper.checkForDocumentCreated;

function CreateDocument () {
  events.EventEmitter.call(this);
}

// inherit from node's event emitter
util.inherits(CreateDocument, events.EventEmitter);

CreateDocument.prototype.command = function (documentName, databaseName, docContents) {
  const couchUrl = this.client.options.db_url;

  if (!docContents) {
    docContents = { dummyKey: 'testingValue' };
  }
  docContents._id = documentName;

  request({
    method: 'POST',
    uri: couchUrl + '/' + databaseName + '?w=3',
    body: docContents,
    json: true
  }, (err, res, body) => {
    if (err) {
      console.log('Error in nano CreateDocument Function: ' + documentName + ', in database: ' + databaseName, err.message);
    }
    console.log('nano  - created a doc: ' + documentName + ', in database: ' + databaseName);

    if (!databaseName) {
      databaseName = helpers.testDatabaseName;
    }
    if (documentName.startsWith('_design/')) {
      documentName = '_design/' + encodeURIComponent(documentName.substr(8));
    } else {
      documentName = encodeURIComponent(documentName);
    }
    const url = [couchUrl, databaseName, documentName].join('/');

    checkForDocumentCreated(url, helpers.maxWaitTime, () => {
      this.emit('complete');
    });

  });

  return this;
};

module.exports = CreateDocument;
