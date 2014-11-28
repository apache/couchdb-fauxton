exports.command = function () {

  var client = this,
      baseUrl = client.globals.baseUrl;

  client
    .url(baseUrl+'/#login')
    .waitForElementPresent('a[href="#login"]', 15000, false)
    .click('a[href="#login"]')
    .waitForElementPresent('#username', 10000, false)
    .setValue('#username', ['tester'])
    .setValue('#password', ['testerpass', client.Keys.ENTER])
    .closeNotification()
    .waitForElementPresent('#jump-to-db', 10000, false);

  return this;
};
