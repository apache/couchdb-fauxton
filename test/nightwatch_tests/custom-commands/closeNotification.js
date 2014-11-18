exports.command = function () {
  var waitTime = 8000,
      client = this;

  client
    .waitForElementPresent('#global-notifications button.close', waitTime, false)
    .click('#global-notifications button.close');

  return this;
};
