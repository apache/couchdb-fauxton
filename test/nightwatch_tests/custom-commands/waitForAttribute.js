// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

var util = require('util');
var events = require('events');
var helpers = require('../helpers/helpers.js');

/*
 * This custom command allows us to locate an HTML element on the page and then wait until the value of a specified
 * attribute matches the provided expression (aka. the 'checker' function). It retries executing the checker function
 * every 100ms until either it evaluates to true or it reaches maxTimeInMilliseconds (which fails the test).
 * Nightwatch uses the Node.js EventEmitter pattern to handle asynchronous code so this command is also an EventEmitter.
 */

function WaitForAttribute() {
  events.EventEmitter.call(this);
  this.startTimeInMilliseconds = null;
}

util.inherits(WaitForAttribute, events.EventEmitter);

WaitForAttribute.prototype.command = function (element, attribute, checker, timeoutInMilliseconds) {
  this.startTimeInMilliseconds = new Date().getTime();
  var self = this;
  var message;

  if (typeof timeoutInMilliseconds !== 'number') {
    timeoutInMilliseconds = helpers.maxWaitTime;
  }

  this.check(element, attribute, checker, function (result, loadedTimeInMilliseconds) {
    if (result) {
      message = 'waitForAttribute: ' + element + '@' + attribute + '. Expression was true after ' + (loadedTimeInMilliseconds - self.startTimeInMilliseconds) + ' ms.';
    } else {
      message = 'waitForAttribute: ' + element + '@' + attribute + '. Expression wasn\'t true in ' + timeoutInMilliseconds + ' ms.';
    }
    self.client.assertion(result, 'expression false', 'expression true', message, true);
    self.emit('complete');
  }, timeoutInMilliseconds);

  return this;
};

WaitForAttribute.prototype.check = function (element, attribute, checker, callback, maxTimeInMilliseconds) {
  var self = this;

  this.api.getAttribute(element, attribute, function (result) {
    var now = new Date().getTime();
    if (result.status === 0 && checker(result.value)) {
      callback(true, now);
    } else if (now - self.startTimeInMilliseconds < maxTimeInMilliseconds) {
      setTimeout(function () {
        self.check(element, attribute, checker, callback, maxTimeInMilliseconds);
      }, 100);
    } else {
      callback(false);
    }
  });
};

module.exports = WaitForAttribute;
