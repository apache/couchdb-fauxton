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

import reducer from "../reducers";
import ActionTypes from "../actiontypes";

describe('VerifyInstall Reducer', () => {

  it('initial state has all tests status set to false', () => {
    const newState = reducer(undefined, {type: 'something_else'});

    expect(newState.isVerifying).toBe(false);

    // confirm all the tests are initially marked as incomplete
    Object.keys(newState.tests).forEach((test) => {
      expect(newState.tests[test].complete).toBe(false);
    });
  });

  it('verification status changes to in progress', () => {
    const newState = reducer(undefined, {
      type: ActionTypes.VERIFY_INSTALL_START
    });

    expect(newState.isVerifying).toBe(true);
  });

  it('verification status changes to completed', () => {
    const newState = reducer(undefined, {
      type: ActionTypes.VERIFY_INSTALL_ALL_TESTS_COMPLETE
    });
    expect(newState.isVerifying).toBe(false);
  });

  it('resets status of all tests', () => {
    const state = {
      tests: {
        TEST1: { complete: true, success: true },
        TEST2: { complete: true, success: false  },
        TEST3: { complete: false, success: false  }
      }
    };
    const newState = reducer(state, {
      type: ActionTypes.VERIFY_INSTALL_RESET
    });
    Object.keys(newState.tests).forEach((test) => {
      expect(newState.tests[test].complete).toBe(false);
      expect(newState.tests[test].success).not.toBeDefined();
    });
  });

});
