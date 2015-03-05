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
  'addons/documents/index-results/actiontypes',
  'addons/documents/header/header.actiontypes',
  "addons/documents/resources"
],

function (FauxtonAPI, ActionTypes, HeaderActionTypes, Documents) {
  var Stores = {};

  /*TODO:
    remove header code, add delete, clean up pagination tests
    */

  Stores.IndexResultsStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this._deleteable = false;
      this._collection = [];
      this.clearSelectedItems();
      this.clearCollapsedDocs();
      this._isLoading = false;
    },

    clearSelectedItems: function () {
      this._selectedItems = {};
    },

    clearCollapsedDocs: function () {
      this._collapsedDocs = {};
    },

    newResults: function (options) {
      this._collection = options.collection;
      this._deleteable = options.deleteable;
      this.clearSelectedItems();
      this.clearCollapsedDocs();
    },

    hasReduce: function () {
      if (!this._collection || !this._collection.params) {
        return false;
      }
      return this._collection.params.reduce;
    },

    getCollection: function () {
      return this._collection;
    },

    getDocContent: function (originalDoc) {
      var doc = originalDoc.toJSON();

      if (this.isCollapsed(doc._id)) {
        doc = {
          _id: _.isUndefined(doc._id),
          _rev: doc._rev
        };
      }

      return JSON.stringify(doc, null, "  ");
    },

    getDocId: function (doc) {

      if (!_.isUndefined(doc.id)) {
        return doc.id;
      }

      if (!_.isNull(doc.get('key'))) {
        return doc.get('key').toString();
      }

      return '';
    },

    getResults: function () {
      return this._collection.map(function (doc) {
        return {
          content: this.getDocContent(doc),
          id: this.getDocId(doc),
          keylabel: doc.isFromView() ? 'key' : 'id',
          url: doc.isFromView() ? doc.url('app') : doc.url('web-index')
        };
      }, this);
    },

    hasResults: function () {
      if (this._isLoading) { return this._isLoading; }
      return this._collection.length > 0;
    },

    isDeleteable: function () {
      return this._deleteable;
    },

    selectDoc: function (id) {
      if (!this._selectedItems[id]) {
        this._selectedItems[id] = true;
      } else {
        delete this._selectedItems[id];
      }
    },

    selectListOfDocs: function (ids) {
      this.clearSelectedItems();
      _.each(ids, function (id) {
        this.selectDoc(id);
      }, this);
    },

    selectAllDocuments: function () {
      this.clearSelectedItems();
      this._collection.each(function (doc) {
        this.selectDoc(doc.id);
      }, this);
    },

    deSelectAllDocuments: function () {
      this.clearSelectedItems();
    },

    getSelectedItemsLength: function () {
      return _.keys(this._selectedItems).length;
    },

    getCollapsedDocsLength: function () {
      return _.keys(this._collapsedDocs).length;
    },

    getCollapsedDocs: function () {
      return this._collapsedDocs;
    },

    getDatabase: function () {
      return this._collection.database;
    },

    createBulkDeleteFromSelected: function () {
      var items = _.map(_.keys(this._selectedItems), function (id) {
        var doc = this._collection.get(id);

        return {
          _id: doc.id,
          _rev: doc.get('_rev'),
          _deleted: true
        };
      }, this);

      var bulkDelete = new Documents.BulkDeleteDocCollection(items, {
        databaseId: this.getDatabase().safeID()
      });

      return bulkDelete;
    },

    canSelectAll: function () {
      return this._collection.length > this.getSelectedItemsLength();
    },

    canDeselectAll: function () {
      return this.getSelectedItemsLength() > 0;
    },

    getSelectedItems: function () {
      return this._selectedItems;
    },

    canCollapseDocs: function () {
      return this._collection.length > this.getCollapsedDocsLength();
    },

    canUncollapseDocs: function () {
      return this.getCollapsedDocsLength() > 0;
    },

    isSelected: function (id) {
      return !!this._selectedItems[id];
    },

    isCollapsed: function (id) {
      return !!this._collapsedDocs[id];
    },

    collapseSelectedDocs: function () {
      _.each(this._selectedItems, function (val, key) {
        this._collapsedDocs[key] = true;
      }, this);
    },

    unCollapseSelectedDocs: function () {
      _.each(this._selectedItems, function (val, key) {
        delete this._collapsedDocs[key];
      }, this);
    },

    clearResultsBeforeFetch: function () {
      this.getCollection().reset();
      this._isLoading = true;
    },

    resultsResetFromFetch: function () {
      this._isLoading = false;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.INDEX_RESULTS_NEW_RESULTS:
          this.newResults(action.options);
          this.triggerChange();
        break;
        case ActionTypes.INDEX_RESULTS_RESET:
          this.resultsResetFromFetch();
          this.triggerChange();
        break;
        case ActionTypes.INDEX_RESULTS_SELECT_DOC:
          this.selectDoc(action.id);
          this.triggerChange();
        break;
        case ActionTypes.INDEX_RESULTS_SELECT_LIST_OF_DOCS:
          this.selectListOfDocs(action.ids);
          this.triggerChange();
        break;
        case ActionTypes.INDEX_RESULTS_CLEAR_RESULTS:
          this.clearResultsBeforeFetch();
          this.triggerChange();
        break;
        case HeaderActionTypes.SELECT_ALL_DOCUMENTS:
          this.selectAllDocuments();
          this.triggerChange();
        break;
        case HeaderActionTypes.DESELECT_ALL_DOCUMENTS:
          this.deSelectAllDocuments();
          this.triggerChange();
        break;
        case HeaderActionTypes.COLLAPSE_DOCUMENTS:
          this.collapseSelectedDocs();
          this.triggerChange();
        break;
        case HeaderActionTypes.EXPAND_DOCUMENTS:
          this.unCollapseSelectedDocs();
          this.triggerChange();
        break;
        default:
        return;
        // do nothing
      }
    }

  });

  Stores.indexResultsStore = new Stores.IndexResultsStore();

  Stores.indexResultsStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.indexResultsStore.dispatch);

  return Stores;

});
