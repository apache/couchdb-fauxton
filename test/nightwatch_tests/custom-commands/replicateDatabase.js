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

function ReplicateDatabase () {
  events.EventEmitter.call(this);
}

// inherit from node's event emitter
util.inherits(ReplicateDatabase, events.EventEmitter);

ReplicateDatabase.prototype.command = function (source, target, options, callback) {
  var that = this,
      nano = helpers.getNanoInstance(this.client.options.db_url),
      opts = options;


  if (opts === undefined) {
    opts = { create_target: false };
  }

  nano.db.replicate(source, target, { create_target: opts.create_target }, function (err, body) {
    if (err) {
      console.log('Nano Error in nano ReplicateDatabase Function: s:' + source + ', t:' + target, err.message);
    }
    console.log('Nano - replicated source: ' + source + " target:" + target);
    // emit the complete event
    that.emit('complete');
  });

  return this;
};

module.exports = ReplicateDatabase;
