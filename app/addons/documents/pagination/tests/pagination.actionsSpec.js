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
  'addons/documents/pagination/actions',
  'addons/documents/pagination/stores',
  'addons/documents/index-results/actions',
  'addons/documents/shared-resources',
  'testUtils',
], function (FauxtonAPI, Actions, Stores, IndexResultsActions, Documents, testUtils) {
  var assert = testUtils.assert;

  FauxtonAPI.router = new FauxtonAPI.Router([]);

  describe('Pagination Actions', function () {

    afterEach(function () {
      Stores.indexPaginationStore.documentsLeftToFetch.restore && Stores.indexPaginationStore.documentsLeftToFetch.restore();
      Stores.indexPaginationStore.getCurrentPage.restore && Stores.indexPaginationStore.getCurrentPage.restore();
      Stores.indexPaginationStore.getPerPage.restore && Stores.indexPaginationStore.getPerPage.restore();

      IndexResultsActions.resultsListReset.restore && IndexResultsActions.resultsListReset.restore();
      Stores.indexPaginationStore.getCollection.restore && Stores.indexPaginationStore.getCollection.restore();
    });

    describe('updatePerPage', function () {

      beforeEach(function () {
        Stores.indexPaginationStore._collection = new Documents.AllDocs([{id:1}, {id: 2}], {
          params: {},
          database: {
            safeID: function () { return '1';}
          }
        });

      });

      it('fetches collection', function () {
        var spy = sinon.spy(Stores.indexPaginationStore, 'getCollection');
        Actions.updatePerPage(30);

        assert.ok(spy.calledOnce);
      });

      it('sends results list reset', function () {
        var promise = $.Deferred();
        promise.resolve();
        var stub = sinon.stub(Stores.indexPaginationStore, 'getCollection');
        var spy = sinon.spy(IndexResultsActions, 'resultsListReset');
        stub.returns({
          fetch: function () { return promise; }
        });

        Actions.updatePerPage(30);
        assert.ok(spy.calledOnce);
      });
    });

    describe('paginateNext', function () {

      it('sends results list reset', function () {
        var promise = $.Deferred();
        promise.resolve();
        var stub = sinon.stub(Stores.indexPaginationStore, 'getCollection');
        var spy = sinon.spy(IndexResultsActions, 'resultsListReset');
        stub.returns({
          next: function () { return promise; }
        });

        Actions.paginateNext();
        assert.ok(spy.calledOnce);
      });

    });

    describe('paginatePrevious', function () {

      it('sends results list reset', function () {
        var promise = $.Deferred();
        promise.resolve();
        var stub = sinon.stub(Stores.indexPaginationStore, 'getCollection');
        var spy = sinon.spy(IndexResultsActions, 'resultsListReset');
        stub.returns({
          previous: function () { return promise; }
        });

        Actions.paginatePrevious();
        assert.ok(spy.calledOnce);
      });

    });
  });

});
