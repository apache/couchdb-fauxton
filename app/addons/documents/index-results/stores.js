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
  'addons/documents/index-results/actiontypes',
  'addons/documents/header/header.actiontypes',
  'addons/documents/resources',
  'addons/documents/mango/mango.helper'
],

function (app, FauxtonAPI, ActionTypes, HeaderActionTypes, Documents, MangoHelper) {
  var Stores = {};

  /*TODO:
    remove header code, add delete, clean up pagination tests
    */

  Stores.IndexResultsStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._collection = [];
      this.clearSelectedItems();
      this._isLoading = false;
      this._textEmptyIndex = 'No Index Created Yet!';
      this._typeOfIndex = 'view';
      this._lastQuery = null;
      this._bulkDeleteDocCollection = null;
    },

    clearSelectedItems: function () {
      this._selectedItems = {};
    },

    newResults: function (options) {
      this._collection = options.collection;
      this.clearSelectedItems();

      this._bulkDeleteDocCollection = options.bulkCollection;

      if (options.textEmptyIndex) {
        this._textEmptyIndex = options.textEmptyIndex;
      }

      if (options.typeOfIndex) {
        this._typeOfIndex = options.typeOfIndex;
      }

      if (options.query) {
        this._lastQuery = options.query;
      }
    },

    getTypeOfIndex: function () {
      return this._typeOfIndex;
    },

    getLastQuery: function () {
      return this._lastQuery;
    },

    isEditable: function (doc) {
      if (!this._collection) {
        return false;
      }

      if (doc && this.isGhostDoc(doc)) {
        return false;
      }

      if (doc && !doc.get('_id')) {
        return false;
      }

      if (!this._collection.isEditable) {
        return false;
      }

      return this._collection.isEditable();
    },

    isGhostDoc: function (doc) {
      // ghost docs are empty results where all properties were
      // filtered away by mango
      return !doc || !doc.attributes || !Object.keys(doc.attributes).length;
    },

    isDeletable: function (doc) {
      if (this.isGhostDoc(doc)) {
        return false;
      }

      return doc.isDeletable();
    },

    getCollection: function () {
      return this._collection;
    },

    getDocContent: function (originalDoc) {
      var doc = originalDoc.toJSON();

      if (this._allCollapsed) {
        return JSON.stringify({id: doc.id, rev: doc._rev}, null, ' ');
      }

      return JSON.stringify(doc, null, ' ');
    },

    getDocId: function (doc) {

      if (!_.isUndefined(doc.id)) {
        return doc.id;
      }

      if (doc.get('key')) {
        return doc.get('key').toString();
      }

      return '';
    },

    getMangoDocContent: function (originalDoc) {
      var doc = originalDoc.toJSON();

      delete doc.ddoc;
      delete doc.name;

      if (this._allCollapsed) {
        return '';
      }

      return JSON.stringify(doc, null, ' ');
    },

    getMangoDoc: function (doc, index) {
      var selector,
          header;

      if (doc.get('def') && doc.get('def').fields) {

        header = MangoHelper.getIndexName(doc);

        return {
          content: this.getMangoDocContent(doc),
          header: header,
          id: doc.getId(),
          keylabel: '',
          url: doc.isFromView() ? doc.url('app') : doc.url('web-index'),
          isDeletable: this.isDeletable(doc),
          isEditable: this.isEditable(doc)
        };
      }

      // we filtered away our content with the fields param
      return {
        content: ' ',
        header: header,
        id: this.getDocId(doc) + index,
        keylabel: '',
        url: this.isEditable(doc) ? doc.url('app') : null,
        isDeletable: this.isDeletable(doc),
        isEditable: this.isEditable(doc)
      };

    },

    getResults: function () {
      var hasEditableAndDeletableDoc;
      var res;
      var collection;


      function filterOutGeneratedMangoDocs (doc) {
        if (doc.get && typeof doc.get === 'function') {
          return doc.get('language') !== 'query';
        }

        return doc.language !== 'query';
      }

      // Table sytle view
      if (this.getIsTableView()) {
        collection = this._collection.toJSON().filter(filterOutGeneratedMangoDocs);
        return this.getTableViewData(collection);
      }

      // JSON style views
      res = this._collection
        .filter(filterOutGeneratedMangoDocs)
        .map(function (doc, i) {
          if (doc.get('def') || this.isGhostDoc(doc)) {
            return this.getMangoDoc(doc, i);
          }
          return {
            content: this.getDocContent(doc),
            id: this.getDocId(doc),
            header: this.getDocId(doc),
            keylabel: doc.isFromView() ? 'key' : 'id',
            url: this.getDocId(doc) ? doc.url('app') : null,
            isDeletable: this.isDeletable(doc),
            isEditable: this.isEditable(doc)
          };
        }, this);

      hasEditableAndDeletableDoc = this.getHasEditableAndDeletableDoc(res);

      return {
        hasEditableAndDeletableDoc: hasEditableAndDeletableDoc,
        results: res
      };
    },

    getPseudoSchema: function (data) {
      var cache = [];

      data.forEach(function (el) {
        Object.keys(el).forEach(function (k) {
          cache.push(k);
        });
      });

      cache = _.uniq(cache);

      // always begin with _id
      var i = cache.indexOf('_id');
      if (i !== -1) {
        cache.splice(i, 1);
        cache.unshift('_id');
      }

      return cache;
    },

    // filter out cruft and JSONify strings
    normalizeTableData: function (data) {
      // include_docs enabled
      if (data[0] && data[0].doc && data[0].doc._rev) {
        return data.map(function (el) {
          el = el.doc;
          return el;
        });
      }

      return data;
    },

    getTableViewData: function (data, hasEditableAndDeletableDoc) {
      var res;
      var schema;
      var database;

      data = this.normalizeTableData(data);
      schema = this.getPseudoSchema(data);
      database = this.getDatabase().safeID();

      res = data.map(function (doc) {
        var safeId = app.utils.getSafeIdForDoc(doc._id);
        var url;

        if (safeId) {
          url = FauxtonAPI.urls('document', 'app', database, safeId);
        }

        return {
          content: doc,
          id: safeId,
          header: '',
          keylabel: '',
          url: url,
          isDeletable: !!safeId,
          isEditable: !!safeId
        };
      });

      hasEditableAndDeletableDoc = this.getHasEditableAndDeletableDoc(res);

      return {
        hasEditableAndDeletableDoc: hasEditableAndDeletableDoc,
        schema: schema,
        results: res
      };
    },

    getHasEditableAndDeletableDoc: function (data) {
      var found = false;
      var length = data.length;
      var i;

      // use a for loop here as we can end it once we found the first id
      for (i = 0; i < length; i++) {
        if (data[i].id) {
          found = true;
          break;
        }
      }

      return found;
    },

    hasResults: function () {
      if (this.isLoading()) { return this.isLoading(); }
      return this._collection.length > 0;
    },

    isLoading: function () {
      return this._isLoading;
    },

    selectDoc: function (id) {
      if (!id || id === '_all_docs') {
        return;
      }

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

    toggleSelectAllDocuments: function () {
      if (this.areAllDocumentsSelected()) {
        return this.clearSelectedItems();
      }

      return this.selectAllDocuments();
    },

    areAllDocumentsSelected: function () {
      return Object.keys(this._selectedItems).length === this._collection.length;
    },

    getSelectedItemsLength: function () {
      return Object.keys(this._selectedItems).length;
    },

    getDatabase: function () {
      return this._collection.database;
    },

    getTextEmptyIndex: function () {
      return this._textEmptyIndex;
    },

    setbulkDeleteDocCollection: function (bulkDeleteDocCollection) {
      this._bulkDeleteDocCollection = bulkDeleteDocCollection;
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

      var bulkDelete = new this._bulkDeleteDocCollection(items, {
        databaseId: this.getDatabase().safeID()
      });

      return bulkDelete;
    },

    canSelectAll: function () {
      var length = this._collection.length;

      if (this._collection.get && this._collection.get('_all_docs')) {
        length = length - 1;
      }

      return length > this.getSelectedItemsLength();
    },

    canDeselectAll: function () {
      return this.getSelectedItemsLength() > 0;
    },

    getSelectedItems: function () {
      return this._selectedItems;
    },

    hasSelectedItem: function () {
      return this.getSelectedItemsLength() > 0;
    },

    collapseAllDocs: function () {
      this.disableTableView();

      this._allCollapsed = true;
    },

    unCollapseAllDocs: function () {
      this.disableTableView();

      this._allCollapsed = false;
    },

    enableTableView: function () {
      this._allCollapsed = false;
      this._tableView = true;
    },

    disableTableView: function () {
      this._allCollapsed = false;
      this._tableView = false;
    },

    getIsTableView: function () {
      return this._tableView;
    },

    getCurrentViewType: function () {

      if (this._tableView) {
        return 'table';
      }

      if (this._allCollapsed) {
        return 'collapsed';
      }

      return 'expanded';
    },

    clearResultsBeforeFetch: function () {
      if (this._collection && this._collection.reset) {
        this._collection.reset();
      }
      this._isLoading = true;
    },

    resultsResetFromFetch: function () {
      this._isLoading = false;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.INDEX_RESULTS_NEW_RESULTS:
          this.newResults(action.options);
        break;
        case ActionTypes.INDEX_RESULTS_RESET:
          this.resultsResetFromFetch();
        break;
        case ActionTypes.INDEX_RESULTS_SELECT_DOC:
          this.selectDoc(action.id);
        break;
        case ActionTypes.INDEX_RESULTS_SELECT_LIST_OF_DOCS:
          this.selectListOfDocs(action.ids);
        break;
        case ActionTypes.INDEX_RESULTS_CLEAR_RESULTS:
          this.clearResultsBeforeFetch();
        break;
        case ActionTypes.INDEX_RESULTS_SELECT_ALL_DOCUMENTS:
          this.selectAllDocuments();
        break;
        case ActionTypes.INDEX_RESULTS_TOOGLE_SELECT_ALL_DOCUMENTS:
          this.toggleSelectAllDocuments();
        break;
        case HeaderActionTypes.COLLAPSE_DOCUMENTS:
          this.collapseSelectedDocs();
        break;
        case HeaderActionTypes.EXPAND_DOCUMENTS:
          this.unCollapseSelectedDocs();
        break;
        case HeaderActionTypes.COLLAPSE_ALL_DOCUMENTS:
          this.collapseAllDocs();
        break;
        case HeaderActionTypes.EXPAND_ALL_DOCUMENTS:
          this.unCollapseAllDocs();
        break;
        case HeaderActionTypes.DISABLE_TABLE_VIEW:
          this.disableTableView();
        break;
        case HeaderActionTypes.ENABLE_TABLE_VIEW:
          this.enableTableView();
        break;

        default:
        return;
        // do nothing
      }

      this.triggerChange();
    }

  });

  Stores.indexResultsStore = new Stores.IndexResultsStore();

  Stores.indexResultsStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.indexResultsStore.dispatch);

  return Stores;

});
