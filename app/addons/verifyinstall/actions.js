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
import VerifyInstall from "./resources";
import ActionTypes from "./actiontypes";


// helper function to publish success/fail result of a single test having been ran
const testPassed = function (test) {
  return function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.VERIFY_INSTALL_SINGLE_TEST_COMPLETE,
      test: test,
      success: true
    });
  };
};

let allTestsPassed = true;
const testFailed = function (test) {
  return function (xhr) {
    allTestsPassed = false;
    if (!xhr) { return; }

    FauxtonAPI.dispatch({
      type: ActionTypes.VERIFY_INSTALL_SINGLE_TEST_COMPLETE,
      test: test,
      success: false
    });
    let reason = 'n/a';
    if (xhr.responseText) {
      reason = JSON.parse(xhr.responseText).reason;
    } else if (xhr.message) {
      reason = xhr.message;
    }
    FauxtonAPI.addNotification({
      msg: 'Error: ' + reason,
      type: 'error'
    });
  };
};


export default {
  resetStore: function () {
    FauxtonAPI.dispatch({ type: ActionTypes.VERIFY_INSTALL_RESET });
  },

  startVerification: function () {

    // announce that we're starting the verification tests
    FauxtonAPI.dispatch({ type: ActionTypes.VERIFY_INSTALL_START });

    var testProcess = VerifyInstall.testProcess;

    testProcess.setup()
      .then(() => {
        return testProcess.saveDB().then(testPassed(Constants.TESTS.CREATE_DATABASE));
      }, testFailed(Constants.TESTS.CREATE_DATABASE))
      .then(() => {
        return testProcess.saveDoc().then(testPassed(Constants.TESTS.CREATE_DOCUMENT));
      }, testFailed(Constants.TESTS.CREATE_DATABASE))
      .then(() => {
        return testProcess.updateDoc().then(testPassed(Constants.TESTS.UPDATE_DOCUMENT));
      }, testFailed(Constants.TESTS.CREATE_DOCUMENT))
      .then(() => {
        return testProcess.destroyDoc().then(testPassed(Constants.TESTS.DELETE_DOCUMENT));
      }, testFailed(Constants.TESTS.UPDATE_DOCUMENT))
      .then(() => {
        return testProcess.setupView().then(() => {
          return testProcess.testView().then(testPassed(Constants.TESTS.CREATE_VIEW));
        });
      }, testFailed(Constants.TESTS.DELETE_DOCUMENT))
      .then(() => {
        return testProcess.setupReplicate().then(() => {
          return testProcess.testReplicate().then(testPassed(Constants.TESTS.REPLICATION));
        });
      }, testFailed(Constants.TESTS.CREATE_VIEW))
      .then(() => {}, testFailed(Constants.TESTS.REPLICATION))
      .then(() => {
        // now announce the tests have been ran
        FauxtonAPI.dispatch({ type: ActionTypes.VERIFY_INSTALL_ALL_TESTS_COMPLETE });

        if (allTestsPassed) {
          FauxtonAPI.addNotification({
            msg: 'Success! Your CouchDB installation is working. Time to Relax.',
            type: 'success'
          });
        }

        testProcess.removeDBs();
      });
  }
};
