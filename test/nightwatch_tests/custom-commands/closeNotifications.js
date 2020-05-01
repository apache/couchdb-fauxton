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

var helpers = require('../helpers/helpers.js');

exports.command = function () {
  var client = this,
      dismissSelector = '.Toastify__toast-container .Toastify__toast-body';

  client
    .waitForElementVisible(dismissSelector, helpers.maxWaitTime, false)
    .keys(client.Keys.ESCAPE)
    .waitForElementNotPresent(dismissSelector, helpers.maxWaitTime, false);

  return this;
};
