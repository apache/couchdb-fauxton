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
import Actions from "../designdocinfo/actions";
import testUtils from "../../../../test/mocha/testUtils";
import sinon from "sinon";
const {assert, restore} = testUtils;

describe('DesignDocInfo Actions', () => {

  describe('fetchDesignDocInfo', () => {

    afterEach(() => {
      restore(Actions.monitorDesignDoc);
    });

    it('calls monitorDesignDoc on successful fetch', () => {
      const promise = FauxtonAPI.Deferred();
      promise.resolve();
      const fakeDesignDocInfo = {
        fetch: () => {
          return promise;
        }
      };

      const spy = sinon.spy(Actions, 'monitorDesignDoc');

      return Actions.fetchDesignDocInfo({
        ddocName: 'test-designdoc-info',
        designDocInfo: fakeDesignDocInfo
      }).then(() => {
        assert.ok(spy.calledOnce);
      });
    });
  });
});
