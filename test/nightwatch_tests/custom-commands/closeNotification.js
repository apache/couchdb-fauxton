exports.command = function () {
  var waitTime = 8000,
      client = this,
      dismissSelector = '#global-notifications [data-dismiss="alert"]';

  client
    .waitForElementPresent(dismissSelector, waitTime, false)
    .click(dismissSelector);

  return this;
};
