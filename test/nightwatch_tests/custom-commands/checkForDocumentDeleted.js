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
const checkForDocumentDeleted = commandHelper.checkForDocumentDeleted;

function CheckForDocumentDeleted () {
  events.EventEmitter.call(this);
}

// inherit from node's event emitter
util.inherits(CheckForDocumentDeleted, events.EventEmitter);

CheckForDocumentDeleted.prototype.command = function (doc, timeout, db) {
  const couchUrl = this.client.options.db_url;

  if (!db) {
    db = helpers.testDatabaseName;
  }

  if (!timeout) {
    timeout = helpers.maxWaitTime;
  }

  const url = [couchUrl, db, doc].join('/');

  console.log('checking this doc is deleted: ', url);
  checkForDocumentDeleted(url, timeout, () => {
    this.emit('complete');
  });

  return this;
};

module.exports = CheckForDocumentDeleted;
