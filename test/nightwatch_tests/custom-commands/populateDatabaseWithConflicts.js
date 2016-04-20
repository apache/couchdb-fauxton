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

const util = require('util');
const events = require('events');
const helpers = require('../helpers/helpers.js');
const request = require('request');

function PopulateDatabaseWithConflicts () {
  events.EventEmitter.call(this);
}

util.inherits(PopulateDatabaseWithConflicts, events.EventEmitter);

PopulateDatabaseWithConflicts.prototype.command = function (databaseName) {
  const nano = helpers.getNanoInstance(this.client.options.db_url);
  const database = nano.use(databaseName);
  const dbUrl = this.client.options.db_url;


  database.insert({
    hat: 'flamingo'
  }, 'outfit1', function () {
    createConflictingDoc(null, function () {
      this.emit('complete');
    }.bind(this));
  }.bind(this));

  function createConflictingDoc (err, cb) {
    request({
      uri: dbUrl + '/' + databaseName + '/conflictingdoc',
      method: 'PUT',
      json: true,
      body: {
        id: 'conflictingdoc',
        rocko: 'dances'
      }
    }, function (err, res, body) {
      if (err) {
        console.log(
          'Error in nano populateDatabase Function: ' + err.message
        );
      }
      request({
        uri: dbUrl + '/' + databaseName + '/conflictingdoc?new_edits=false',
        method: 'PUT',
        json: true,
        body: {
          _rev: '4-afae890a0310210db079b0f49fb2569d',
          rocko: 'jumps'
        }
      }, function (err, res, body) {
        if (err) {
          console.log('Error in nano populateDatabase Function: ' +
            err.message);
        }

        cb && cb();
      });
    });
  }

  return this;
};

module.exports = PopulateDatabaseWithConflicts;
