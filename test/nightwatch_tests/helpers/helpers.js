var nano = require('nano');

module.exports = {

  testDatabaseName : 'fauxton-selenium-tests',

  getNanoInstance: function () {
    return nano(this.test_settings.db_url);
  },
  beforeEach: function (done) {
    var nano = module.exports.getNanoInstance(),
        database = module.exports.testDatabaseName;

    console.log("nano setting up database");
    // clean up the database we created previously
    nano.db.destroy(database, function (err, body, header) {
      if (err) {
        if (err.message != 'Database does not exist.' && err.message != 'missing') {
          console.log('Error in setting up '+database, err.message);
        }
      }
      // create a new database
      nano.db.create(database, function (err, body, header) {
        if (err) {
         console.log('Error in setting up '+database, err.message);
        }
      done();
      });
    });
  },
  afterEach: function (done) {
    var nano = module.exports.getNanoInstance(),
        database = module.exports.testDatabaseName;

    console.log('nano cleaning up');
    nano.db.destroy(database, function (err, header, body) {
      if (err) {
        console.log('Error in cleaning up '+database, err.message);
      }
      done();
    });
  }
};
