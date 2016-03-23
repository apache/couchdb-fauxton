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

function DeleteDatabase () {
  events.EventEmitter.call(this);
}

util.inherits(DeleteDatabase, events.EventEmitter);

DeleteDatabase.prototype.command = function (databaseName) {
  var that = this,
      nano = helpers.getNanoInstance(this.client.options.db_url);

  nano.db.destroy(databaseName, function (err, body, header) {
    if (err) {
      console.log('Error in nano DeleteDatabase Function: ' + databaseName, err.message);
    }
    console.log('nano - database: ' + databaseName + ' is deleted: ', body);
    // emit the complete event
    that.emit('complete');
  });

  return this;
};

module.exports = DeleteDatabase;
