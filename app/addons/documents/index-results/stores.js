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
  'addons/documents/resources',
  'addons/documents/mango/mango.helper'
],

function (FauxtonAPI, ActionTypes, HeaderActionTypes, Documents, MangoHelper) {
  var Stores = {};

  /*TODO:
    remove header code, add delete, clean up pagination tests
    */

  Stores.IndexResultsStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this._isListDeletable = false;
      this._collection = [];
      this.clearSelectedItems();
      this.clearCollapsedDocs();
      this._isLoading = false;
      this._textEmptyIndex = 'No Index Created Yet!';
      this._typeOfIndex = 'view';
      this._lastQuery = null;
      this._bulkDeleteDocCollection = null;
    },

    clearSelectedItems: function () {
      this._selectedItems = {};
    },

    clearCollapsedDocs: function () {
      this._collapsedDocs = {};
    },

    newResults: function (options) {
      this._collection = options.collection;
      this._isListDeletable = options.isListDeletable;
      this.clearSelectedItems();
      this.clearCollapsedDocs();

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

    isListDeletable: function () {
      return this._isListDeletable;
    },

    getCollection: function () {
      return this._collection;
    },

    getDocContent: function (originalDoc) {
      var doc = originalDoc.toJSON();

      return this.isCollapsed(doc._id) ? '' : JSON.stringify(doc, null, ' ');
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

      return this.isCollapsed(originalDoc.id) ? '' : JSON.stringify(doc, null, ' ');
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
      function filterOutGeneratedMangoDocs (doc) {
        return doc.get('language') !== 'query';
      }

      return this._collection
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
