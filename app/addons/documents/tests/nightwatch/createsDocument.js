module.exports = {
  'Creates a document' : function (client) {
    /*jshint multistr: true */
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName = 'create_doc_document',
        baseUrl = client.globals.baseUrl;
    
    client
      .loginToGUI()
      .url(baseUrl+'/#/database/'+newDatabaseName+'/_all_docs')
      .waitForElementPresent('#new-all-docs-button', waitTime, false)
      .click('#new-all-docs-button')
      .waitForElementPresent('#new-all-docs-button a[href="#/database/'+newDatabaseName+'/new"]', waitTime, false)
      .click('#new-all-docs-button a[href="#/database/'+newDatabaseName+'/new"]') 
      .waitForElementPresent('#doc', waitTime, false)
      .verify.urlEquals(baseUrl+'/#/database/'+ newDatabaseName+'/new')
      .execute('\
        var editor = ace.edit("editor-container");\
        editor.gotoLine(2,10);\
        editor.removeWordRight();\
        editor.insert("'+newDocumentName+'");\
      ')
      .waitForElementPresent('#doc button.save-doc.btn.btn-success.save', waitTime, false)
      .click('#doc button.save-doc.btn.btn-success.save')
      .pause(1000)
      .url(baseUrl+'/'+newDatabaseName+'/_all_docs')
      .waitForElementPresent('body', waitTime, false)
      .getText('body', function (result) {
        var data = result.value,
            createdDocIsPresent = data.indexOf(newDocumentName);
     
        this.verify.ok(createdDocIsPresent > 0, 
          'Checking if new document shows up in _all_docs.');
      })
    .end();
  }
};
