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

function CheckForDatabaseDeleted () {
  events.EventEmitter.call(this);
}

// inherit from node's event emitter
util.inherits(CheckForDatabaseDeleted, events.EventEmitter);

CheckForDatabaseDeleted.prototype.command = function (databaseName, timeout) {
  var couchUrl = helpers.test_settings.db_url;
  var that = this;

  if (!timeout) {
    timeout = 15000;
  }

  var timeOutId = setTimeout(function () {
    throw new Error('timeout waiting for db to disappear');
  }, timeout);

  var intervalId = setInterval(function () {
    helpers.reuseNanoCookie(checkForDatabaseDeleted);
  }.bind(this), 1000);
  
  
  function checkForDatabaseDeleted () {
    helpers.nano.db.list(function(err, body, headers) {
      // body is an array
      if (err) {
        console.log('Error in nano checkForDatabaseDeleted: ' + databaseName, err.message);
      }
      // change the cookie if couchdb tells us to
      if (headers && headers['set-cookie']) {
        helpers.auth = headers['set-cookie'];
      }

      body.forEach(function(db) {
        if (db.indexOf(databaseName) === -1) {
          clearTimeout(timeOutId);
          console.log('database not there: ' + databaseName);
          clearInterval(intervalId);
          that.emit('complete');
        }
      });
    });
  }
  return this;
};

module.exports = CheckForDatabaseDeleted;
    // module.exports.nano.db.create(databaseName, function (err, body, headers) {
    //     if (err) {
    //       console.log('Error in nano CreateDatabase Function: ' + databaseName, err.message);

    //     }

    //     // change the cookie if couchdb tells us to
    //     if (headers && headers['set-cookie']) {
    //       module.exports.auth = headers['set-cookie'];
    //     }

    //     console.log('nano - created a database: ' + databaseName);
    //     // emit the complete event
    //     that.emit('complete');
    //   });
    //   return this;
    // }


    // request(couchUrl + '/_all_dbs', function (er, res, body) {
    //   if (body) {
    //     if (body.indexOf(databaseName) === -1) {
    //       clearTimeout(timeOutId);
    //       console.log('database not there: ' + databaseName);
    //       clearInterval(intervalId);
    //       this.emit('complete');
    //     }
    //   }
    // }.bind(this));