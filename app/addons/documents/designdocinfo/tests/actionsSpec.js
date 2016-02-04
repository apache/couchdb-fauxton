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
  '../../../../core/api',
  '../actions',
  '../../../../../test/mocha/testUtils',
  'sinon'
], function (FauxtonAPI, Actions, testUtils, sinon) {
  var assert = testUtils.assert;
  var restore = testUtils.restore;

  describe('DesignDocInfo Actions', function () {

    describe('fetchDesignDocInfo', function () {

      afterEach(function () {
        restore(Actions.monitorDesignDoc);
      });

      it('calls monitorDesignDoc on successful fetch', function () {
        var promise = FauxtonAPI.Deferred();
        promise.resolve();
        var fakeDesignDocInfo = {
          fetch: function () {
            return promise;
          }
        };

        var spy = sinon.spy(Actions, 'monitorDesignDoc');


        Actions.fetchDesignDocInfo({
          ddocName: 'test-designdoc-info',
          designDocInfo: fakeDesignDocInfo
        });

        assert.ok(spy.calledOnce);
      });
    });

  });
});
