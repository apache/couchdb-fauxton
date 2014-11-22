var util = require('util'),
    events = require('events'),
    helpers = require('../helpers/helpers.js');

function CreateManyDocuments () {
  events.EventEmitter.call(this);
}

// inherit from node's event emitter
util.inherits(CreateManyDocuments, events.EventEmitter);

CreateManyDocuments.prototype.command = function (amount, databaseName) {
  var that = this,
      nano = helpers.getNanoInstance(),
      database = nano.use(databaseName),
      docs = [];

  for (var i = 0; i < 100; i++) {
    docs.push({"_id": "" + i, "dummyKey": "testingValue"});
  }

  database.bulk({docs: docs}, function (err, body, header) {
    if (err) {
      throw err;
    }
    that.emit('complete');
  });

  return this;
};

module.exports = CreateManyDocuments;
