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
  'addons/documents/docs-list/actiontypes'
],function (FauxtonAPI, ActionTypes) {

  var Stores = {};

  Stores.AllDocsListStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this._totalRows = 0;
      this._updateSeq = false;
      this._pageStart = 0;
      this._pageEnd = 20;
      this._newView = false;
      this._perPage = FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;
    },

    collectionChanged: function (collection, pagination, perPage) {
     if (!this._newView) {
       this._totalRows = collection.length;
       this._updateSeq = collection.updateSeq();
     }

     this._pageStart = pagination.pageStart();
     this._pageEnd =  pagination.pageEnd();
     this._perPage = perPage;
     this._pagination = pagination;
    },

    getPagination: function () {
      return this._pagination;
    },

    getPerPage: function () {
      return this._perPage;
    },

    setPerPage: function (perPage) {
      this._perPage = perPage;
    },

    getTotalRows: function () {
      return this._totalRows;
    },

    getPageStart: function () {
      return this._pageStart;
    },

    getPageEnd: function () {
      return this._pageEnd;
    },

    getUpdateSeq: function () {
      return this._updateSeq;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.COLLECTION_CHANGED:
          this.collectionChanged(action.collection, action.pagination, action.perPage);
          this.triggerChange();
          break;
        case ActionTypes.PER_PAGE_CHANGE:
          this.setPerPage(action.perPage);
          this.triggerChange();
          break;
        default:
          return;
      }

    }

  });

  Stores.allDocsListStore = new Stores.AllDocsListStore();

  Stores.AllDocsListStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.allDocsListStore.dispatch);

  return Stores;

});
