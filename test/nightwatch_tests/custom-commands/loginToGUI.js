exports.command = function () {

  var client = this,
      baseUrl = client.globals.test_settings.launch_url,
      username = client.globals.test_settings.username,
      password = client.globals.test_settings.password;

  client
    .url(baseUrl+'/#login')
    .waitForElementPresent('a[href="#login"]', 8000, false)
    .click('a[href="#login"]')
    .waitForElementPresent('#username', 8000, false)
    .setValue('#username', [username])
    .setValue('#password', [password, client.Keys.ENTER])
    .closeNotification()
    .waitForElementPresent('#jump-to-db', 8000, false);

  return this;
};
