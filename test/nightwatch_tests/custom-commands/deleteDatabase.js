var util = require('util'),
    events = require('events'),
    helpers = require('../helpers/helpers.js');

function DeleteDatabase () {
  events.EventEmitter.call(this);
}

util.inherits(DeleteDatabase, events.EventEmitter);

DeleteDatabase.prototype.command = function (databaseName) {
  var that = this,
      nano = helpers.getNanoInstance();

  nano.db.destroy(databaseName, function (err, body, header) {
    if (err) {
      console.log('Error in nano DeleteDatabase Function: '+ databaseName, err.message);
    }
    console.log('nano - database: '+databaseName+' is deleted: ', body);
    // emit the complete event
    that.emit('complete');
  });

  return this;
};

module.exports = DeleteDatabase;
