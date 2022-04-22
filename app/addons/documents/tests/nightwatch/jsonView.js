module.exports = {

  'Doc results: check ?include_docs=true returns doc content': function (client) {
    var newDatabaseName = client.globals.testDatabaseName,
        newDocumentName = 'bitterns',
        waitTime = client.globals.maxWaitTime,
        baseUrl = client.options.launch_url;

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
      .waitForElementPresent('.tableview-checkbox-cell', waitTime, false)
      .clickWhenVisible('.fonticon-json')
      .waitForElementPresent('.doc-item', client.globals.maxWaitTime, false)
      // by default include_docs is on, so check "American Bittern" does exist in the DOM
      .waitForElementPresent('.prettyprint', client.globals.maxWaitTime, false)
      .assert.textContains('.prettyprint', 'American Bittern')
      .end();
  }
};

