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
  'addons/documents/pagination/actiontypes'
],function (app, FauxtonAPI, ActionTypes) {

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

    canShowPrevious: function () {
      if (!this._enabled) { return false; }
      return this._collection.hasPrevious();
    },

    canShowNext: function () {
      if (!this._enabled) { return this._enabled; }

      if ((this._pageStart + this._perPage) >= this._docLimit) {
        return false;
      }

      return this._collection.hasNext();
    },

    paginateNext: function () {
      this._currentPage += 1;
      this._pageStart += this.getPerPage();
    },

    paginatePrevious: function () {
      this._currentPage -= 1;

      this._pageStart = this._pageStart - this.getPerPage();
      if (this._pageStart < 1) {
        this._pageStart = 1;
      }
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
      return this._collection.updateSeq();
    },

    dispatch: function (action) {

      switch (action.type) {
        case ActionTypes.NEW_PAGINATION:
          this.newPagination(action.collection);
          this.triggerChange();
        break;
        case ActionTypes.SET_PAGINATION_DOCUMENT_LIMIT:
          this.setDocumentLimit(action.docLimit);
          this.triggerChange();
        break;
        case ActionTypes.PAGINATION_COLLECTION_RESET:
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
