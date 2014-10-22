var util = require('util'),
    events = require('events'),
    helpers = require('../helpers/helpers.js');

function CreateDatabase () {
  events.EventEmitter.call(this);
}

// inherit from node's event emitter
util.inherits(CreateDatabase, events.EventEmitter);

CreateDatabase.prototype.command = function (databaseName) {
  var that = this,
      nano = helpers.getNanoInstance();

  nano.db.create(databaseName, function (err, body, header) {
    if (err) {
      console.log('Error in nano CreateDatabase Function: '+ databaseName, err.message);
      
    }
    console.log('nano - created a database: ' + databaseName);
    // emit the complete event
    that.emit('complete');
  });
  return this;
};

module.exports = CreateDatabase;
