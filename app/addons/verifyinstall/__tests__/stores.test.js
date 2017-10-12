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

import FauxtonAPI from "../../../core/api";
import testUtils from "../../../../test/mocha/testUtils";
import Stores from "../stores";
import ActionTypes from "../actiontypes";

var assert = testUtils.assert;

describe('VerifyInstallStore', () => {

  afterEach(() => {
    Stores.verifyInstallStore.reset();
  });

  it('check store defaults', () => {
    assert.ok(Stores.verifyInstallStore.checkIsVerifying() === false);

    // confirm all the tests are initially marked as incomplete
    const tests = Stores.verifyInstallStore.getTestResults();
    _.each(tests, (test) => {
      assert.ok(test.complete === false);
    });
  });

  it('publishing start event changes state in store', () => {
    FauxtonAPI.dispatch({ type: ActionTypes.VERIFY_INSTALL_START });
    assert.ok(Stores.verifyInstallStore.checkIsVerifying() === true);
  });

  it('publishing completion event changes state in store', () => {
    FauxtonAPI.dispatch({ type: ActionTypes.VERIFY_INSTALL_ALL_TESTS_COMPLETE });
    assert.ok(Stores.verifyInstallStore.checkIsVerifying() === false);
  });

});
