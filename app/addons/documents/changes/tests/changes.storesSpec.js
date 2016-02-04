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
  '../../../../app',
  '../../../../core/api',
  '../stores',
  '../../../../../test/mocha/testUtils',
], function (app, FauxtonAPI, Stores, utils) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;


  describe('ChangesStore', function () {

    afterEach(function () {
      Stores.changesStore.reset();
    });

    it('toggleTabVisibility() changes state in store', function () {
      assert.ok(Stores.changesStore.isTabVisible() === false);
      Stores.changesStore.toggleTabVisibility();
      assert.ok(Stores.changesStore.isTabVisible() === true);
    });

    it('reset() changes tab visibility to hidden', function () {
      Stores.changesStore.toggleTabVisibility();
      Stores.changesStore.reset();
      assert.ok(Stores.changesStore.isTabVisible() === false);
    });

    it('addFilter() adds item in store', function () {
      var filter = 'My filter';
      Stores.changesStore.addFilter(filter);
      var filters = Stores.changesStore.getFilters();
      assert.ok(filters.length === 1);
      assert.ok(filters[0] === filter);
    });

    it('removeFilter() removes item from store', function () {
      var filter1 = 'My filter 1';
      var filter2 = 'My filter 2';
      Stores.changesStore.addFilter(filter1);
      Stores.changesStore.addFilter(filter2);
      Stores.changesStore.removeFilter(filter1);

      var filters = Stores.changesStore.getFilters();
      assert.ok(filters.length === 1);
      assert.ok(filters[0] === filter2);
    });

    it('hasFilter() finds item in store', function () {
      var filter = 'My filter';
      Stores.changesStore.addFilter(filter);
      assert.ok(Stores.changesStore.hasFilter(filter) === true);
    });

    it('getDatabaseName() returns database name', function () {
      var dbName = 'hoopoes';
      Stores.changesStore.initChanges({ databaseName: dbName });
      assert.equal(Stores.changesStore.getDatabaseName(), dbName);

      Stores.changesStore.reset();
      assert.equal(Stores.changesStore.getDatabaseName(), '');
    });

    it("getChanges() should return a subset if there are a lot of changes", function () {

      // to keep the test speedy, we override the default max value
      var maxChanges = 10;
      var changes = [];
      _.times(maxChanges + 10, function (i) {
        changes.push({ id: 'doc_' + i, seq: 1, changes: {}});
      });
      Stores.changesStore.initChanges({ databaseName: "test" });
      Stores.changesStore.setMaxChanges(maxChanges);

      var seqNum = 123;
      Stores.changesStore.updateChanges(seqNum, changes);

      var results = Stores.changesStore.getChanges();
      assert.equal(maxChanges, results.length);
    });

    it("tracks last sequence number", function () {
      assert.equal(null, Stores.changesStore.getLastSeqNum());

      var seqNum = 123;
      Stores.changesStore.updateChanges(seqNum, []);

      // confirm it's been stored
      assert.equal(seqNum, Stores.changesStore.getLastSeqNum());
    });

  });

});
