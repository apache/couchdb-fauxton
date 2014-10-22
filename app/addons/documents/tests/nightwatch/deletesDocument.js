module.exports = {
  'Deletes a document': function (client) {
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName = 'delete_doc_doc',
        baseUrl = client.globals.baseUrl;

    client
      .loginToGUI()
      .createDocument(newDocumentName, newDatabaseName)
      .url(baseUrl)
      .waitForElementPresent('#dashboard-content a[href="#/database/'+newDatabaseName+'/_all_docs"]', waitTime, false)
      .pause(1000)
      .click('#dashboard-content a[href="#/database/'+newDatabaseName+'/_all_docs"]')
      .waitForElementPresent('[data-id="'+newDocumentName+'"] .btn.btn-small.btn-danger.delete', waitTime, false)
      .execute('$("[data-id=\''+newDocumentName+'\'] .btn.btn-small.btn-danger.delete").click();')
      .acceptAlert()
      .waitForElementVisible('#global-notifications .alert.alert-info', waitTime, false)
      .url(baseUrl+'/'+newDatabaseName+'/_all_docs')
      .waitForElementPresent('pre', waitTime, false)
      .getText('pre',function (result) {
        var data = result.value,
            createdDocumentNotPresent = data.indexOf(newDocumentName);

        this.verify.ok(createdDocumentNotPresent === -1,
          'Checking if new document no longer shows up in _all_docs.');
      })
    .end();
  }
};
