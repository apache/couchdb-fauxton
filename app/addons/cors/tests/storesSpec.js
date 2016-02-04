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
  '../../../app',
  '../../../../test/mocha/testUtils',
  '../../../core/api',
  '../stores',
], function (app, testUtils, FauxtonAPI, Stores) {
  var assert = testUtils.assert;
  var store = Stores.corsStore;

  describe('CORS store', function () {

    describe('isAllOrigins', function () {

      it('returns true for all origins', function () {
        store._origins = ['*'];

        assert.ok(store.isAllOrigins());
      });

      it('returns false for specific origins', function () {
        store._origins = ['https://hello.com', 'http://another.com'];
        assert.notOk(store.isAllOrigins());
      });

      it('returns false for empty array', function () {
        store._origins = [];
        assert.notOk(store.isAllOrigins());
      });
    });

    describe('addOrigin', function () {

      it('adds Origin to list', function () {
        var origin = 'http://hello.com';
        store._origins = [];
        store.addOrigin(origin);

        assert.ok(_.include(store.getOrigins(), origin));
      });

    });

    describe('originChange', function () {

      it('sets origins to * for true', function () {
        store.originChange(true);

        assert.deepEqual(store.getOrigins(), ['*']);
      });

      it('sets origins to [] for true', function () {
        store.originChange(false);

        assert.deepEqual(store.getOrigins(), []);
      });

    });

    describe('deleteOrigin', function () {

      it('removes origin', function () {
        store._origins = ['http://first.com', 'http://hello.com', 'http://second.com'];
        store.deleteOrigin('http://hello.com');

        assert.deepEqual(store.getOrigins(), ['http://first.com', 'http://second.com']);

      });

    });

    describe('update origin', function () {

      it('removes old origin', function () {
        store._origins = ['http://first.com', 'http://hello.com', 'http://second.com'];
        store.updateOrigin('http://hello123.com', 'http://hello.com');

        assert.notOk(_.include(store.getOrigins(), 'http://hello.com'));

      });

      it('adds new origin', function () {
        store._origins = ['http://first.com', 'http://hello.com', 'http://second.com'];
        store.updateOrigin('http://hello123.com', 'http://hello.com');

        assert.ok(_.include(store.getOrigins(), 'http://hello123.com'));

      });

    });

  });

});
