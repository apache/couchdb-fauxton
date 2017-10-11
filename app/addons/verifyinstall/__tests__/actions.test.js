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
import sinon from "sinon";

var assert = testUtils.assert;

describe('Verify Install Actions', () => {

  it('resets the store when action called', () => {
    var spy = sinon.spy(Stores.verifyInstallStore, 'reset');
    FauxtonAPI.dispatch({ type: ActionTypes.VERIFY_INSTALL_RESET });
    assert.ok(spy.calledOnce);
  });

});
