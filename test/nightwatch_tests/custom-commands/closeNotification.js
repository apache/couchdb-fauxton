exports.command = function () {
  var waitTime = 8000,
      client = this,
      dismissSelector = '#global-notifications .js-dismiss';

  client
    .waitForElementPresent(dismissSelector, waitTime, false)
    .click(dismissSelector);

  return this;
};
