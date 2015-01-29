var util = require('util'),
    events = require('events'),
    helpers = require('../helpers/helpers.js'),
    async = require('async');

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
      var document_id = 'document_'+ i;
      database.insert({ number: i }, document_id, cb);
    },
    function (err) {
      if (err) {
        console.log('Error in nano populateDatabase Function: ' +
          ' in database: ' + databaseName, err.message);
      }

      database.insert({
        views: {
          "stubview": {
            "map": "function(doc) {\n  emit(doc._id, 'stub');\n}"
          }
        }
      },
      '_design/testdesigndoc', function (er) {
        if (err) {
          console.log('Error in nano populateDatabase Function: ' +
            err.message);
        }
        that.emit('complete');
      });

    }
  );
  return this;
};

module.exports = PopulateDatabase;
