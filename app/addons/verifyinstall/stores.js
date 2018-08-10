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

import FauxtonAPI from "../../core/api";
import Constants from "./constants";
import ActionTypes from "./actiontypes";

var VerifyInstallStore = FauxtonAPI.Store.extend({
  initialize: function () {
    this.reset();
  },

  reset: function () {
    this._isVerifying = false;

    // reset all the tests
    this._tests = {};
    _.each(Object.keys(Constants.TESTS), (key) => {
      this._tests[Constants.TESTS[key]] = { complete: false };
    });
  },

  startVerification: function () {
    this._isVerifying = true;
  },

  stopVerification: function () {
    this._isVerifying = false;
  },

  checkIsVerifying: function () {
    return this._isVerifying;
  },

  updateTestStatus: function (test, success) {

    // shouldn't ever occur since we're using constants for the test names
    if (!_.has(this._tests, test)) {
      throw new Error('Invalid test name passed to updateTestStatus()');
    }

    // mark this test as complete, and track whether it was a success or failure
    this._tests[test] = { complete: true, success: success };
  },

  getTestResults: function () {
    return this._tests;
  },

  dispatch: function (action) {
    switch (action.type) {
      case ActionTypes.VERIFY_INSTALL_START:
        this.startVerification();
        this.triggerChange();
        break;

      case ActionTypes.VERIFY_INSTALL_RESET:
        this.reset();
        this.triggerChange();
        break;

      case ActionTypes.VERIFY_INSTALL_SINGLE_TEST_COMPLETE:
        this.updateTestStatus(action.test, action.success);
        this.triggerChange();
        break;

      case ActionTypes.VERIFY_INSTALL_ALL_TESTS_COMPLETE:
        this.stopVerification();
        this.triggerChange();
        break;

      default:
        return;
    }
  }
});


var Stores = {};
Stores.verifyInstallStore = new VerifyInstallStore();
Stores.verifyInstallStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.verifyInstallStore.dispatch.bind(Stores.verifyInstallStore));


export default Stores;
