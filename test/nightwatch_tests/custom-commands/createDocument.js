var util = require('util'),
    events = require('events'),
    helpers = require('../helpers/helpers.js');

function CreateDocument () {
  events.EventEmitter.call(this);
}

// inherit from node's event emitter
util.inherits(CreateDocument, events.EventEmitter);

CreateDocument.prototype.command = function (documentName, databaseName) {
  var that = this,
      nano = helpers.getNanoInstance(),
      database = nano.use(databaseName);

  database.insert({ dummyKey: "testingValue" }, documentName, function (err, body, header) {
  
    if (err) {
      console.log('Error in nano CreateDocument Function: '+documentName+', in database: '+databaseName, err.message);
    }
    console.log('nano  - created a doc: '+documentName+', in database: '+databaseName);
    that.emit('complete');
  });

  return this;
};

module.exports = CreateDocument;