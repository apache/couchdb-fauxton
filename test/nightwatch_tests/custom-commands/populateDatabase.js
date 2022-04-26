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
'use strict';

var util = require('util'),
    events = require('events'),
    helpers = require('../helpers/helpers.js'),
    whilst = require('async/whilst'),
    request = require('request');

function PopulateDatabase () {
  events.EventEmitter.call(this);
}

util.inherits(PopulateDatabase, events.EventEmitter);

PopulateDatabase.prototype.command = function (databaseName, count) {
  const nano = helpers.getNanoInstance(this.client.options.db_url);
  const database = nano.use(databaseName);
  const db_url = this.client.options.db_url;
  let i = 0;

  whilst(
    async () => { return i < (count ? count : 20); },
    (cb)  => {
      i++;
      var documentId = 'document_' + i;
      database.insert({
        number: i,
        ente_ente_mango_ananas: i,
        ente_ente_mango_ananas_res: 'foo'
      }, documentId, cb);
    },
    (err) => {
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
      '_design/testdesigndoc', (er) => {
        if (err) {
          console.log('Error in nano populateDatabase Function: ' +
            err.message);
        }

        createKeyView(null, () => {
          createBrokenView(null, () => {
            createMangoIndex(null, db_url, () => {
              this.emit('complete');
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

  function createConflictDesignDoc (err, db_url, cb) {
    request({
      uri: db_url + '/' + databaseName + '/_index',
      method: 'PUT',
      json: true,
      body: {
        _id: "_design/conflicts",
        language: "javascript",
        "views":{"new-view":{"map":"function (doc) {\n  emit(doc._id, 1);\n}"}}
      }
    }, (err, res, body) => {
      if (err) {
        console.log('Error in nano populateDatabase Function: ' +
          err.message);
      }

      cb(null);
    });
  }

  function createMangoIndex (err, db_url, cb) {
    request({
      uri: db_url + '/' + databaseName + '/_index',
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
