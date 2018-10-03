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
const testPassed = function (test, dispatch) {
  return function () {
    dispatch({
      type: ActionTypes.VERIFY_INSTALL_SINGLE_TEST_COMPLETE,
      test: test,
      success: true
    });
  };
};

let allTestsPassed = true;
const testFailed = function (test, dispatch) {
  return function (xhr) {
    allTestsPassed = false;
    if (!xhr) { return; }

    dispatch({
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


export const resetTests = () => (dispatch) => {
  dispatch({ type: ActionTypes.VERIFY_INSTALL_RESET });
};

export const startVerification = () => (dispatch) => {
  // announce that we're starting the verification tests
  dispatch({ type: ActionTypes.VERIFY_INSTALL_START });

  const testProcess = VerifyInstall.testProcess;
  testProcess.setup()
    .then(() => {
      return testProcess.saveDB().then(testPassed(Constants.TESTS.CREATE_DATABASE, dispatch));
    }, testFailed(Constants.TESTS.CREATE_DATABASE, dispatch))
    .then(() => {
      return testProcess.saveDoc().then(testPassed(Constants.TESTS.CREATE_DOCUMENT, dispatch));
    }, testFailed(Constants.TESTS.CREATE_DATABASE, dispatch))
    .then(() => {
      return testProcess.updateDoc().then(testPassed(Constants.TESTS.UPDATE_DOCUMENT, dispatch));
    }, testFailed(Constants.TESTS.CREATE_DOCUMENT, dispatch))
    .then(() => {
      return testProcess.destroyDoc().then(testPassed(Constants.TESTS.DELETE_DOCUMENT, dispatch));
    }, testFailed(Constants.TESTS.UPDATE_DOCUMENT, dispatch))
    .then(() => {
      return testProcess.setupView().then(() => {
        return testProcess.testView().then(testPassed(Constants.TESTS.CREATE_VIEW, dispatch));
      });
    }, testFailed(Constants.TESTS.DELETE_DOCUMENT, dispatch))
    .then(() => {
      return testProcess.setupReplicate().then(() => {
        return testProcess.testReplicate().then(testPassed(Constants.TESTS.REPLICATION, dispatch));
      });
    }, testFailed(Constants.TESTS.CREATE_VIEW, dispatch))
    .then(() => {}, testFailed(Constants.TESTS.REPLICATION, dispatch))
    .then(() => {
      // now announce the tests have been ran
      dispatch({ type: ActionTypes.VERIFY_INSTALL_ALL_TESTS_COMPLETE });

      if (allTestsPassed) {
        FauxtonAPI.addNotification({
          msg: 'Success! Your CouchDB installation is working. Time to Relax.',
          type: 'success'
        });
      }

      testProcess.removeDBs();
    });
};
