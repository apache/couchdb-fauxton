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

define([
  '../../app',
  '../../core/api',
  './constants',
  './resources',
  './actiontypes'
],
function (app, FauxtonAPI, Constants, VerifyInstall, ActionTypes) {


  // helper function to publish success/fail result of a single test having been ran
  var testPassed = function (test) {
    FauxtonAPI.dispatch({
      type: ActionTypes.VERIFY_INSTALL_SINGLE_TEST_COMPLETE,
      test: test,
      success: true
    });
  };

  var testFailed = function (test) {
    return function (xhr, error) {
      if (!xhr) { return; }

      FauxtonAPI.dispatch({
        type: ActionTypes.VERIFY_INSTALL_SINGLE_TEST_COMPLETE,
        test: test,
        success: false
      });

      FauxtonAPI.addNotification({
        msg: 'Error: ' + JSON.parse(xhr.responseText).reason,
        type: 'error'
      });
    };
  };


  return {
    resetStore: function () {
      FauxtonAPI.dispatch({ type: ActionTypes.VERIFY_INSTALL_RESET });
    },

    startVerification: function () {

      // announce that we're starting the verification tests
      FauxtonAPI.dispatch({ type: ActionTypes.VERIFY_INSTALL_START });

      var testProcess = VerifyInstall.testProcess;

      testProcess.setup()
        .then(function () {
          return testProcess.saveDB();
        }, testFailed(Constants.TESTS.CREATE_DATABASE))
        .then(function () {
          testPassed(Constants.TESTS.CREATE_DATABASE);
          return testProcess.saveDoc();
        }, testFailed(Constants.TESTS.CREATE_DOCUMENT))
        .then(function () {
          testPassed(Constants.TESTS.CREATE_DOCUMENT);
          return testProcess.updateDoc();
        }, testFailed(Constants.TESTS.UPDATE_DOCUMENT))
        .then(function () {
          testPassed(Constants.TESTS.UPDATE_DOCUMENT);
          return testProcess.destroyDoc();
        }, testFailed(Constants.TESTS.DELETE_DOCUMENT))
        .then(function () {
          testPassed(Constants.TESTS.DELETE_DOCUMENT);
          return testProcess.setupView();
        }, testFailed(Constants.TESTS.CREATE_VIEW))
        .then(function () {
          return testProcess.testView();
        }, testFailed(Constants.TESTS.CREATE_VIEW))
        .then(function () {
          testPassed(Constants.TESTS.CREATE_VIEW);
          return testProcess.setupReplicate();
        }, testFailed(Constants.TESTS.CREATE_VIEW))
        .then(function () {
          return testProcess.testReplicate();
        }, testFailed(Constants.TESTS.REPLICATION))
        .then(function () {
          testPassed(Constants.TESTS.REPLICATION);

          // now announce the tests have been ran
          FauxtonAPI.dispatch({ type: ActionTypes.VERIFY_INSTALL_ALL_TESTS_COMPLETE });

          FauxtonAPI.addNotification({
            msg: 'Success! Your CouchDB installation is working. Time to Relax.',
            type: 'success'
          });

          testProcess.removeDBs();
        }, testFailed(Constants.TESTS.REPLICATION));
    }
  };


});
