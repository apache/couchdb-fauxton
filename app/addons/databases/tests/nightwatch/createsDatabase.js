module.exports = {
  'Creates a Database' : function (client) {
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.baseUrl;

    client
      .loginToGUI()
      .deleteDatabase(newDatabaseName) //need to delete the automatic database 'fauxton-selenium-tests' that has been set up before each test
      .url(baseUrl)
      .waitForElementPresent('#add-new-database', waitTime, false)
      .click('#add-new-database')
      .pause(1000)
      .waitForElementVisible('#js-new-database-name', waitTime, false)
      .setValue('#js-new-database-name', [newDatabaseName])
      .click('#js-create-database')
      .waitForElementVisible('#global-notifications div.alert-success', waitTime, false)
      .url(baseUrl+'/_all_dbs')
      .waitForElementVisible('html', waitTime, false)
      .getText('html', function (result) {
        var data = result.value,
            createdDatabaseIsPresent = data.indexOf(newDatabaseName);

        this.verify.ok(createdDatabaseIsPresent > 0, 
          'Checking if new database shows up in _all_dbs.');
      })
    .end();
  }
};
