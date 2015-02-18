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
  'api',
  'addons/documents/docs-list/stores',
  'addons/documents/docs-list/actiontypes',
  'testUtils'
], function (FauxtonAPI, Stores, ActionTypes, testUtils) {
  var assert = testUtils.assert;
  var store;
  var dispatchToken;


  describe('AllDocsListStore', function () {

    beforeEach(function () {
      store = new Stores.AllDocsListStore();
      dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
    });

    afterEach(function () {
      FauxtonAPI.dispatcher.unregister(dispatchToken);
    });

    describe('#collectionChanged', function () {
      var collection, pagination;
      beforeEach(function () {
        collection = new Backbone.Collection([{id:1}, {id: 2}]);
        collection.updateSeq = function () { return 'updateSeq';};
        pagination = {
          pageStart: function () { return 10; },
          pageEnd: function () { return 30; }
        };
      });

      it('sets total rows correctly', function () {
        store.collectionChanged(collection, pagination);
        assert.equal(store.getTotalRows(), 2);
      });

      it('sets updateSeq', function () {
        store.collectionChanged(collection, pagination);
        assert.equal(store.getUpdateSeq(), 'updateSeq');
      });

      it('sets pageStart', function () {
        store.collectionChanged(collection, pagination);
        assert.equal(store.getPageStart(), 10);
      });

      it('sets pageEnd', function () {
        store.collectionChanged(collection, pagination);
        assert.equal(store.getPageEnd(), 30);
      });

    });


  });
});
