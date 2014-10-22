module.exports = {
  'Creates a View' : function (client) {
    /*jshint multistr: true */
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName = 'create_view_doc',
        baseUrl = client.globals.baseUrl;

    var indexFunctionString = function (parity) {
      return 'function (doc) {'               +  
        ' if (doc.number%2 === '+parity+'){'  +
        '   emit(doc._id, doc.number);'       +  
        ' }'                                  +
        '}';
    };

    client
      .loginToGUI()
      .populateDatabase(newDatabaseName)
      .url(baseUrl+'/#/database/'+newDatabaseName+'/_all_docs')
      .waitForElementPresent('#new-design-docs-button', waitTime, false)
      .click('#new-design-docs-button')
      .click('#new-design-docs-button a[href="#/database/'+newDatabaseName+'/new_view"]')
      .waitForElementPresent('#new-ddoc', waitTime, false)
      .setValue('#new-ddoc','test_design_doc')
      .clearValue('#index-name')
      .setValue('#index-name','even_ids')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("'+indexFunctionString(0)+'");\
      ')
      .click('button.btn.btn-success.save')
      .waitForElementPresent('#test_design_doc_even_ids', waitTime, false)
      .click('#test_design_doc_even_ids')
      .waitForElementPresent('#nav-header-test_design_doc', waitTime, false)
      .click('#nav-header-test_design_doc .dropdown-toggle.icon.fonticon-plus-circled')
      .waitForElementPresent('#nav-header-test_design_doc', waitTime, false)
      .click('#nav-header-test_design_doc a[href="#/database/'+newDatabaseName+'/new_view/test_design_doc"]')
      .verify.valueContains('#index-name','newView')
      .clearValue('#index-name')
      .setValue('#index-name','odd_ids')
      .execute('\
        var editor = ace.edit("map-function");\
        editor.getSession().setValue("'+indexFunctionString(1)+'");\
      ')
      .click('button.btn.btn-success.save')
      .waitForElementPresent('#test_design_doc_even_ids', waitTime, false)
      .waitForElementPresent('#test_design_doc_odd_ids', waitTime, false)
    .end();
  }
};
