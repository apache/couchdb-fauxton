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
  '../stores',
  '../actiontypes',
  '../../../../../test/mocha/testUtils',
], function (FauxtonAPI, Stores, ActionTypes, testUtils) {
  var assert = testUtils.assert;
  var dispatchToken;
  var store;
  var opts;

  describe('QueryOptions Store', function () {
    beforeEach(function () {
      store = new Stores.QueryOptionsStore();
      dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
    });

    afterEach(function () {
      FauxtonAPI.dispatcher.unregister(dispatchToken);
    });

    describe('Toggle By Keys and Between Keys', function () {

      it('toggling by keys sets by keys to true', function () {

        store.toggleByKeys();

        assert.ok(store.showByKeys());
      });

      it('toggling between keys sets between keys to true', function () {

        store.toggleBetweenKeys();
        assert.ok(store.showBetweenKeys());
      });

      it('toggling between keys sets by keys to false', function () {
        store._showByKeys = true;
        store.toggleBetweenKeys();
        assert.notOk(store.showByKeys());
      });

      it('toggling by keys sets between keys to false', function () {
        store._showBetweenKeys = true;
        store.toggleByKeys();
        assert.notOk(store.showBetweenKeys());
      });

    });

    describe('getQueryParams', function () {
      it('returns params for default', function () {
        assert.deepEqual(store.getQueryParams(), {});
      });

      it('with betweenKeys', function () {
        store.toggleBetweenKeys();
        store.updateBetweenKeys({
          startkey:"a",
          endkey: "z",
          include: true
        });

        assert.deepEqual(store.getQueryParams(), {
          inclusive_end: true,
          start_key: 'a',
          end_key: 'z'
        });
      });

      it('with byKeys', function () {
        store.toggleByKeys();
        store.updateByKeys("[1,2,3]");

        assert.deepEqual(store.getQueryParams(), {
          keys: "[1,2,3]"
        });
      });
    });

    describe('setQueryParams', function () {

      it('sets all store values from given params', function () {

        store.setQueryParams({
          include_docs: true,
          limit: 10,
          skip: 5,
          descending: true
        });

        assert.ok(store.includeDocs());
        assert.ok(store.descending());
        assert.equal(store.limit(), 10);
        assert.equal(store.skip(), 5);
      });

      it('sets between keys', function () {
        store.setQueryParams({
          start_key: 1,
          end_key: 5
        });

        assert.equal(store.betweenKeys().startkey, 1);
        assert.equal(store.betweenKeys().endkey, 5);
        assert.ok(store.betweenKeys().include);
        assert.ok(store.showBetweenKeys());
      });

      it('sets by keys', function () {
        store.setQueryParams({
          keys: [1, 2, 3]
        });

        assert.deepEqual(store.byKeys(), [1, 2, 3]);
        assert.ok(store.showByKeys());
      });

    });
  });
});
