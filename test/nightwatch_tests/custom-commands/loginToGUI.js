exports.command = function () {

  var client = this,
      baseUrl = client.globals.baseUrl;

  client
    .url(baseUrl+'/#login')
    .waitForElementPresent('a[href="#login"]', 8000, false)
    .click('a[href="#login"]')
    .waitForElementPresent('#username', 8000, false)
    .setValue('#username', ['tester'])
    .setValue('#password', ['testerpass', client.Keys.ENTER])
    .execute('$("#global-notifications button.close").click();')
    .waitForElementPresent('#jump-to-db', 8000, false);
      
  return this;
};
