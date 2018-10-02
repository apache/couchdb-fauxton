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

import ActionTypes from './actiontypes';
import Constants from './constants';

const initialState = {
  isVerifying: false,
  tests: {}
};
Object.keys(Constants.TESTS).forEach((key) => {
  initialState.tests[Constants.TESTS[key]] = { complete: false };
});

function resetTests(tests) {
  const testsCopy = {...tests};
  Object.keys(testsCopy).forEach((key) => {
    testsCopy[key] = { complete: false };
  });
  return testsCopy;
}

function updateTestStatus(tests, test, success) {
  const testsCopy = {...tests};

  // shouldn't ever occur since we're using constants for the test names
  if (!_.has(testsCopy, test)) {
    throw new Error('Invalid test name passed to updateTestStatus()');
  }

  // mark this test as complete, and track whether it was a success or failure
  testsCopy[test] = { complete: true, success: success };
  return testsCopy;
}

export default function verifyinstall (state = initialState, action) {
  switch (action.type) {

    case ActionTypes.VERIFY_INSTALL_START:
      return {
        ...state,
        isVerifying: true
      };

    case ActionTypes.VERIFY_INSTALL_RESET:
      return {
        ...state,
        tests: resetTests(state.tests)
      };

    case ActionTypes.VERIFY_INSTALL_SINGLE_TEST_COMPLETE:
      return {
        ...state,
        tests: updateTestStatus(state.tests, action.test, action.success)
      };

    case ActionTypes.VERIFY_INSTALL_ALL_TESTS_COMPLETE:
      return {
        ...state,
        isVerifying: false
      };

    default:
      return state;
  }
}
