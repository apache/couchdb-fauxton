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

import FauxtonAPI from "../../../../core/api";
import Stores from "../mango.stores";
import testUtils from "../../../../../test/mocha/testUtils";
var assert = testUtils.assert;
var dispatchToken;
var store;

describe('Mango Store', function () {

  describe('getQueryCode', function () {

    beforeEach(function () {
      store = new Stores.MangoStore();
      dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
    });

    afterEach(function () {
      FauxtonAPI.dispatcher.unregister(dispatchToken);
    });

    it('returns a default query', function () {
      assert.ok(store.getQueryFindCode());
    });
  });
});
