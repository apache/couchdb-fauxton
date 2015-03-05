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
  'addons/documents/pagination/stores',
  'addons/documents/pagination/actiontypes',
  'addons/documents/shared-resources',
  'testUtils'
], function (FauxtonAPI, Stores, ActionTypes, Documents, testUtils) {
  var assert = testUtils.assert;
  var dispatchToken;
  var store;

  describe('Index Pagination Store', function () {

    beforeEach(function () {
      store = new Stores.IndexPaginationStore();
      dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
    });

    afterEach(function () {
      FauxtonAPI.dispatcher.unregister(dispatchToken);
    });

    describe('#collectionChanged', function () {
      var collection;
      beforeEach(function () {
        collection = new Documents.AllDocs([{id:1}, {id: 2}], {
          params: {},
          database: {
            safeID: function () { return '1';}
          }
        });
        collection.updateSeq = function () { return 'updateSeq';};
        store.reset();
      });

      it('sets total rows correctly', function () {
        store.newPagination(collection);
        assert.equal(store.getTotalRows(), 2);
      });

      it('sets updateSeq', function () {
        store.newPagination(collection);
        assert.equal(store.getUpdateSeq(), 'updateSeq');
      });

    });

    describe('canShowPrevious', function () {
      it('cannot show previous if disabled', function () {
        store._enabled = false;
        assert.notOk(store.canShowPrevious());
      });

      it('can show if collection can show', function () {
        store._enabled = true;
        store._collection = new Backbone.Collection();
        store._collection.hasPrevious = function () { return true;};
        assert.ok(store.canShowPrevious());
      });

    });

    describe('canShowNext', function () {
      it('cannot show next if disabled', function () {
        store._enabled = false;
        assert.notOk(store.canShowNext());
      });

      it('cannot show if pageStart and perPage greater than docLimit', function () {
        store._enabled = true;
        store._docLimit = 10;
        store._perPage = 20;

        assert.notOk(store.canShowNext());
      });

      it('can show if collection can show', function () {
        store._enabled = true;
        store._docLimit = 100000;
        store.reset();
        store._collection = new Backbone.Collection();
        store._collection.hasNext = function () { return true;};
        assert.ok(store.canShowNext());
      });
    });

    describe('paginateNext', function () {
      beforeEach(function () {
        store.setPerPage(20);
        store._collection = new Documents.AllDocs(null, {
          params: {},
          database: {
            safeID: function () { return '1';}
          }
        });
      });

      it('should increment page number', function () {

        store.reset();
        store.paginateNext();

        assert.equal(store.getCurrentPage(), 2);
      });

      it('should increment page start', function () {

        store.reset();
        store.paginateNext();

        assert.equal(store.getPageStart(), 21);
      });

      it('should set correct page end', function () {
        store._collection.length = 20;
        store.reset();
        store.paginateNext();

        assert.equal(store.getPageEnd(), 40);
      });

      it('should set collection pageSize', function () {
        store.reset();
        store.paginateNext();

        assert.equal(store.getCollection().paging.pageSize, 20);
      });
    });

    describe('paginatePrevious', function () {
      beforeEach(function () {
        store.reset();
        store._collection = new Documents.AllDocs(null, {
          params: {},
          database: {
            safeID: function () { return '1';}
          }
        });
      });

      it('should decrement page number', function () {
        store.paginateNext();
        store.paginatePrevious();

        assert.equal(store.getCurrentPage(), 1);
      });

      it('should decrement page start', function () {
        store.paginateNext();
        store.paginatePrevious();

        assert.equal(store.getPageStart(), 1);
      });

      it('should decrement page end', function () {
        store._collection.length = 20;
        store.paginateNext();
        store.paginatePrevious();

        assert.equal(store.getPageEnd(), 20);
      });

      it('should set collection pageSize', function () {
        store.reset();
        store.paginateNext();
        store.paginatePrevious();

        assert.equal(store.getCollection().paging.pageSize, 20);
      });

    });

    describe('totalDocsViewed', function () {
      beforeEach(function () {
        store.reset();
      });

      it('returns correct count for page 1 and 20 docs per page', function () {
        assert.equal(store.totalDocsViewed(), 20);
      });

      it('returns correct count for page 3 and 10 docs per page', function () {
        store._perPage = 10;
        store._currentPage = 3;

        assert.equal(store.totalDocsViewed(), 30);
      });
    });

    describe('documentsLeftToFetch', function () {
      beforeEach(function () {
        store.reset();
      });

      it('returns 20 documents left', function () {
        assert.equal(store.documentsLeftToFetch(), 20);
      });

      it('returns less if close to limit', function () {
        store._docLimit = 35;
        store._perPage = 10;
        store._currentPage = 3;
        assert.equal(store.documentsLeftToFetch(), 5);
      });

    });

    describe('#initPerPage', function () {

      it('uses default if no local storage set', function () {
        window.localStorage.removeItem('fauxton:perpage');
        store.initPerPage();
        assert.equal(store.getPerPage(), 20);
      });

      it('uses localstorage when available', function () {
        window.localStorage.setItem('fauxton:perpage', 44);
        store.initPerPage();
        assert.equal(store.getPerPage(), 44);
      });

      it('uses doc limit when its less than perPage', function () {
        window.localStorage.setItem('fauxton:perpage', 100);
        store._docLimit = 6;
        store.initPerPage();
        assert.equal(store.getPerPage(), 6);
      });

    });

    describe('#setDocumentLimit', function () {

      it('sets document if exists', function () {
        store.setDocumentLimit(10);
        assert.equal(store._docLimit, 10);
      });

      it('sets perPage to doclimit if doclimit less than perPage', function () {
        store.setPerPage(20);
        store.setDocumentLimit(1);
        assert.equal(store._docLimit, 1);
      });

      it('sets doclimit to 10000 if NaN', function () {
        store.setDocumentLimit(NaN);
        assert.equal(store._docLimit, 10000);
      });
    });

    describe('#setPerPage', function () {
      beforeEach(function () {
        store.reset();
        store._collection = new Documents.AllDocs(null, {
          params: {},
          database: {
            safeID: function () { return '1';}
          }
        });

      });

      it('stores per page in local storage', function () {
        var testPerPage = 111;
        store.setPerPage(testPerPage);
        var perPage = window.localStorage.getItem('fauxton:perpage');
        assert.equal(perPage, testPerPage );
      });

      it('sets collections perPage', function () {
        var spy = sinon.spy(store._collection, 'pageSizeReset');
        var testPerPage = 110;

        store.setPerPage(testPerPage);
        assert.equal(spy.getCall(0).args[0], testPerPage);


      });
    });
  });
});
