module.exports = {

  'Doc results: check ?include_docs=true returns doc content': function (client) {
    var newDatabaseName = client.globals.testDatabaseName,
        newDocumentName = 'bitterns',
        baseUrl = client.globals.test_settings.launch_url;

    var docContent = {
      "species": "American Bittern",
      "seen_general": "not as often as I'd like",
      "seen_this_year": "*sigh*, no."
    };

    client
      .createDocument(newDocumentName, newDatabaseName, docContent)
      .loginToGUI()
      .checkForDocumentCreated(newDocumentName)

      .url(baseUrl + '#/database/' + newDatabaseName + '/_all_docs')
      .waitForElementPresent('.doc-item', client.globals.maxWaitTime, false)
      // by default include_docs is off, so check "American Bittern" doesn't exist in the DOM
      .getText('body', function (result) {
        var birdNameNotPresent = result.value.indexOf('"American Bittern"') === -1;
        this.verify.ok(birdNameNotPresent, 'Checking doc content doesn\'t show up in results.');
      })

      // now enable ?include_docs and try again
      .url(baseUrl + '#/database/' + newDatabaseName + '/_find')
      .waitForElementPresent('.watermark-logo', client.globals.maxWaitTime, false)
      .url(baseUrl + '#/database/' + newDatabaseName + '/_all_docs?include_docs=true')

      .waitForElementPresent('.prettyprint', client.globals.maxWaitTime, false)
      .assert.containsText('.prettyprint', 'American Bittern')
      .end();
  }
};
