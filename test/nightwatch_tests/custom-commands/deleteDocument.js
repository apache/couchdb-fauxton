var util = require('util'),
    events = require('events'),
    helpers = require('../helpers/helpers.js');

function DeleteDocument () {
  events.EventEmitter.call(this);
}

util.inherits(DeleteDocument, events.EventEmitter);

//  !!!!!   documentName must be all lowercase for this to work

DeleteDocument.prototype.command = function (databaseName, documentName) {
  var that = this,
      nano = helpers.getNanoInstance(this.client.options.db_url),
      database = nano.use(databaseName),
      documentRev;

  database.get(documentName, function (err, body) {
    if (!err) {
      documentRev = body._rev;

      database.destroy(documentName, documentRev, function (err, body, header) {
        if (err) {
          console.log('Error in nano DeleteDocument Function: (' + databaseName + ')', err.message);
        }
        console.log('nano - document: ' + documentName + ' in ' + databaseName + ' is deleted: ', body);
      });

    } else {
      console.log("Error in nano- Get documentRev", err.message);
    }
    // emit the complete event
    that.emit('complete');
  });

  return this;
};

module.exports = DeleteDocument;
