// Copyright (c) 2014 Dave Koo
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const util = require('util');
const events = require('events');
const helpers = require('../helpers/helpers.js');
const assert = require('assert');

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

WaitForAttribute.prototype.command = function(
  element, attribute, checker, timeoutInMilliseconds) {
  this.startTimeInMilliseconds = new Date().getTime();
  const self = this;
  let message;

  if (typeof timeoutInMilliseconds !== 'number') {
    timeoutInMilliseconds = helpers.maxWaitTime;
  }

  this.check(element, attribute, checker,
    function(result, loadedTimeInMilliseconds) {
      if (result) {
        message = 'waitForAttribute: ' + element + '@' + attribute +
          '. Expression was true after ' +
          (loadedTimeInMilliseconds - self.startTimeInMilliseconds) + ' ms.';
      } else {
        message = 'waitForAttribute: ' + element + '@' + attribute +
          '. Expression wasn\'t true in ' + timeoutInMilliseconds + ' ms.';
      }
      assert.equal(result, true, message);
      self.emit('complete');
    }, timeoutInMilliseconds);

  return this;
};

WaitForAttribute.prototype.check = function(
  element, attribute, checker, callback, maxTimeInMilliseconds) {
  const self = this;

  this.api.getAttribute(element, attribute, function(result) {
    const now = new Date().getTime();
    if (result.status === 0 && checker(result.value)) {
      callback(true, now);
    } else if (now - self.startTimeInMilliseconds < maxTimeInMilliseconds) {
      setTimeout(function() {
        self.check(element, attribute, checker, callback,
          maxTimeInMilliseconds);
      }, 100);
    } else {
      callback(false);
    }
  });
};

module.exports = WaitForAttribute;
