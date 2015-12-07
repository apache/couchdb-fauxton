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

function CheckForDocumentCreated () {
  events.EventEmitter.call(this);
}

// inherit from node's event emitter
util.inherits(CheckForDocumentCreated, events.EventEmitter);

CheckForDocumentCreated.prototype.command = function (doc, timeout, db) {
  var couchUrl = helpers.test_settings.db_url;

  if (!db) {
    db = helpers.testDatabaseName;
  }

  if (!timeout) {
    timeout = helpers.maxWaitTime;
  }

  var timeOutId = setTimeout(function () {
    throw new Error('timeout waiting for doc to appear');
  }, timeout);

  var intervalId = setInterval(function () {
    var url = [couchUrl, db, doc].join('/');

    request(url, function (er, res, body) {
      if (res && /^2..$/.test(res.statusCode)) {
        clearTimeout(timeOutId);
        console.log('doc created: ' + doc);
        clearInterval(intervalId);
        this.emit('complete');
      }
    }.bind(this));
  }.bind(this), 1000);

  return this;
};

module.exports = CheckForDocumentCreated;
