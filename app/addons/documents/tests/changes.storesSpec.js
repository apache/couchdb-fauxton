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
  'app',
  'api',
  'addons/documents/changes/stores',
  'testUtils'
], function (app, FauxtonAPI, Stores, utils) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;


  describe('ChangesHeaderStore', function () {
    it('toggleTabVisibility() changes state in store', function() {
      assert.ok(Stores.changesHeaderStore.isTabVisible() === false);
      Stores.changesHeaderStore.toggleTabVisibility();
      assert.ok(Stores.changesHeaderStore.isTabVisible() === true);
    });

    it('reset() changes tab visibility to hidden', function() {
      Stores.changesHeaderStore.toggleTabVisibility();
      Stores.changesHeaderStore.reset();
      assert.ok(Stores.changesHeaderStore.isTabVisible() === false);
    });
  });


  describe('ChangesFilterStore', function () {

    afterEach(function () {
      Stores.changesFilterStore.reset();
    });

    it('addFilter() adds item in store', function () {
      var filter = 'My filter';
      Stores.changesFilterStore.addFilter(filter);
      var filters = Stores.changesFilterStore.getFilters();
      assert.ok(filters.length === 1);
      assert.ok(filters[0] === filter);
    });

    it('removeFilter() removes item from store', function () {
      var filter1 = 'My filter 1';
      var filter2 = 'My filter 2';
      Stores.changesFilterStore.addFilter(filter1);
      Stores.changesFilterStore.addFilter(filter2);
      Stores.changesFilterStore.removeFilter(filter1);

      var filters = Stores.changesFilterStore.getFilters();
      assert.ok(filters.length === 1);
      assert.ok(filters[0] === filter2);
    });

    it('hasFilter() finds item in store', function () {
      var filter = 'My filter';
      Stores.changesFilterStore.addFilter(filter);
      assert.ok(Stores.changesFilterStore.hasFilter(filter) === true);
    });

  });

});
