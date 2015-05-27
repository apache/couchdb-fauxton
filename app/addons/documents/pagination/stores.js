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
  'addons/documents/pagination/actiontypes',
  'addons/documents/index-results/actiontypes'
], function (app, FauxtonAPI, ActionTypes, IndexResultsActionTypes) {

  var Stores = {};
  var maxDocLimit = 10000;

  Stores.IndexPaginationStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._pageStart = 1;
      this._enabled = true;
      this._currentPage = 1;
      this._pageStart = 1;
      this._newView = false;
      this._docLimit = _.isUndefined(this._docLimit) ? maxDocLimit : this._docLimit;
      this.initPerPage();
    },

    setDocumentLimit: function (docLimit) {
      if (docLimit) {
        this._docLimit = docLimit;
      } else {
        this._docLimit = maxDocLimit;
      }

      this.initPerPage();
    },

    newPagination: function (collection) {
      this._collection = collection;
      this.reset();
    },

    getCollection: function () {
      return this._collection;
    },

    canShowPrevious: function () {
      if (!this._enabled) { return false; }
      if (!this._collection.hasPrevious) { return false; }

      return this._collection.hasPrevious();
    },

    canShowNext: function () {
      if (!this._enabled) { return this._enabled; }

      if ((this._pageStart + this._perPage) >= this._docLimit) {
        return false;
      }

      if (!this._collection.hasNext) { return false; }

      return this._collection.hasNext();
    },

    paginateNext: function () {
      this._currentPage += 1;
      this._pageStart += this.getPerPage();
      this._collection.paging.pageSize = this.documentsLeftToFetch();
    },

    paginatePrevious: function () {
      this._currentPage -= 1;

      this._pageStart = this._pageStart - this.getPerPage();
      if (this._pageStart < 1) {
        this._pageStart = 1;
      }

      this._collection.paging.pageSize = this.getPerPage();
    },

    getCurrentPage: function () {
      return this._currentPage;
    },

    totalDocsViewed: function () {
      return this._perPage * this._currentPage;
    },

    documentsLeftToFetch: function () {
      var documentsLeftToFetch = this._docLimit - this.totalDocsViewed();

      if (documentsLeftToFetch < this.getPerPage() ) {
        return documentsLeftToFetch;
      }

      return this._perPage;
    },

    getPerPage: function () {
      return this._perPage;
    },

    initPerPage: function () {
      var perPage = FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;

      if (window.localStorage) {
        var storedPerPage = app.utils.localStorageGet('fauxton:perpage');

        if (storedPerPage) {
          perPage = parseInt(storedPerPage, 10);
        }
      }

      if (this._docLimit < perPage) {
        perPage = this._docLimit;
      }

      this.setPerPage(perPage);
    },

    setPerPage: function (perPage) {
      this._perPage = perPage;
      app.utils.localStorageSet('fauxton:perpage', perPage);

      if (this._collection && this._collection.pageSizeReset) {
        this._collection.pageSizeReset(perPage, {fetch: false});
      }
    },

    getTotalRows: function () {
      return this._collection.length;
    },

    getPageStart: function () {
      return this._pageStart;
    },

    getPageEnd: function () {
      return this._pageStart + this._collection.length - 1;
    },

    getUpdateSeq: function () {
      if (!this._collection.updateSeq) { return false; }
      return this._collection.updateSeq();
    },

    dispatch: function (action) {

      switch (action.type) {
        case IndexResultsActionTypes.INDEX_RESULTS_NEW_RESULTS:
          this.newPagination(action.options.collection);
          this.triggerChange();
        break;
        case ActionTypes.SET_PAGINATION_DOCUMENT_LIMIT:
          this.setDocumentLimit(action.docLimit);
          this.triggerChange();
        break;
        case IndexResultsActionTypes.INDEX_RESULTS_RESET:
          this.triggerChange();
        break;
        case ActionTypes.PAGINATE_NEXT:
          this.paginateNext();
          this.triggerChange();
        break;
        case ActionTypes.PAGINATE_PREVIOUS:
          this.paginatePrevious();
          this.triggerChange();
        break;
        case ActionTypes.PER_PAGE_CHANGE:
          this.reset();
          this.setPerPage(action.perPage);
          this.triggerChange();
        break;
        default:
        return;
      }
    }
  });

  Stores.indexPaginationStore = new Stores.IndexPaginationStore();
  Stores.indexPaginationStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.indexPaginationStore.dispatch);

  return Stores;

});
