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
    async = require('async'),
    request = require('request');

function PopulateDatabase () {
  events.EventEmitter.call(this);
}

util.inherits(PopulateDatabase, events.EventEmitter);

PopulateDatabase.prototype.command = function (databaseName, count) {
  var that = this,
      nano = helpers.getNanoInstance(),
      database = nano.use(databaseName),
      i = 0;

  async.whilst(
    function () { return i < (count ? count : 20); },
    function (cb) {
      i++;
      var documentId = 'document_' + i;
      database.insert({
        number: i,
        ente_ente_mango_ananas: i,
        ente_ente_mango_ananas_res: 'foo'
      }, documentId, cb);
    },
    function (err) {
      if (err) {
        console.log('Error in nano populateDatabase Function: ' +
          ' in database: ' + databaseName, err.message);
      }

      database.insert({
        views: {
          "stubview": {
            "map": "function(doc) {\n  emit('stub', 2);\n}",
            "reduce": "_count"
          }
        }
      },
      '_design/testdesigndoc', function (er) {
        if (err) {
          console.log('Error in nano populateDatabase Function: ' +
            err.message);
        }

        createKeyView(null, function () {
          createBrokenView(null, function () {
            createMangoIndex(null, function () {
              that.emit('complete');
            });
          });
        });
      });
    }
  );

  function createKeyView (err, cb) {
    database.insert({
      views: {
        "keyview": {
          "map": "function(doc) {\n  emit(doc._id, 1);\n}"
        }
      }
    },
    '_design/keyview', function (er) {
      if (err) {
        console.log('Error in nano populateDatabase Function: ' +
          err.message);
      }
      cb();
    });
  }

  function createBrokenView (err, cb) {
    database.insert({
      views: {
        'brokenview': {
          'map': 'function (doc) {\n emit(doc._id, doc._id); \n}',
          'reduce': '_sum'
        }
      }
    },
    '_design/brokenview', function (er) {
      if (err) {
        console.log('Error in nano populateDatabase Function: ' +
          err.message);
      }
      cb();
    });
  }

  function createMangoIndex (err, cb) {
    request({
      uri: helpers.test_settings.db_url + '/' + databaseName + '/_index',
      method: 'POST',
      json: true,
      body: {
        index: {
          fields: ['ente_ente_mango_ananas']
        },
        name: 'rocko-artischockbert',
        type: 'json'
      }
    }, function (err, res, body) {
      if (err) {
        console.log('Error in nano populateDatabase Function: ' +
          err.message);
      }

      cb && cb();
    });
  }

  return this;
};

module.exports = PopulateDatabase;
