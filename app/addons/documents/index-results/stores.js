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

import app from "../../../app";
import FauxtonAPI from "../../../core/api";
import ActionTypes from "./actiontypes";
import HeaderActionTypes from "../header/header.actiontypes";
import PaginationActionTypes from "../pagination/actiontypes";
import MangoHelper from "../mango/mango.helper";
import Resources from "../resources";
import Constants from "../constants";

var Stores = {};

var maxDocLimit = 10000;

Stores.IndexResultsStore = FauxtonAPI.Store.extend({

  initialize: function () {
    this.reset();
  },

  reset: function () {
    this._collection = new (FauxtonAPI.Collection.extend({
      url: ''
    }))();

    this._filteredCollection = [];
    this._bulkDeleteDocCollection = new Resources.BulkDeleteDocCollection([], {});

    this.clearSelectedItems();
    this._isLoading = false;
    this._textEmptyIndex = 'No Documents Found';
    this._typeOfIndex = 'view';

    this._tableViewSelectedFields = [];
    this._isPrioritizedEnabled = false;
    this._explain = false;

    this._tableSchema = [];
    this._selectedLayout = Constants.LAYOUT_ORIENTATION.METADATA;

    this.resetPagination();
  },

  resetPagination: function () {
    this._pageStart = 1;
    this._currentPage = 1;
    this._enabled = true;
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

  canShowPrevious: function () {
    if (!this._enabled) { return false; }
    if (!this._collection || !this._collection.hasPrevious) { return false; }
    return this._collection.hasPrevious();
  },

  canShowNext: function () {
    if (!this._enabled) { return this._enabled; }

    if ((this._pageStart + this._perPage) >= this._docLimit) {
      return false;
    }

    if (!this._collection || !this._collection.hasNext) { return false; }

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

    if (documentsLeftToFetch < this.getPerPage()) {
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
    if (!this._collection) { return false; }

    return this._collection.length;
  },

  setPageStart: function (options) {
    this._pageStart = options.start + 1;
  },

  getPageStart: function () {
    return this._pageStart;
  },

  getPageEnd: function () {
    if (!this._collection) { return false; }
    return this._pageStart + this._collection.length - 1;
  },

  clearSelectedItems: function () {
    this._bulkDeleteDocCollection.reset([]);
  },

  newResults: function (options) {
    this._collection = options.collection;

    this._bulkDeleteDocCollection = options.bulkCollection;

    if (options.textEmptyIndex) {
      this._textEmptyIndex = options.textEmptyIndex;
    }

    if (options.typeOfIndex) {
      this._typeOfIndex = options.typeOfIndex;
    }

    // layout shifting magic to support refreshes, query options, and results toolbar
    if (this.getIsMetadataView() && (this.isIncludeDocsEnabled() || this.getIsMangoResults())) {
      this._selectedLayout = Constants.LAYOUT_ORIENTATION.TABLE;
    }

    if (!this.getIsMetadataView() && !this.isIncludeDocsEnabled() && !this.getIsMangoResults()) {
      this._selectedLayout = Constants.LAYOUT_ORIENTATION.METADATA;
    }

    if (this.getIsMangoIndexResults()) {
      this._selectedLayout = Constants.LAYOUT_ORIENTATION.JSON;
    }

    this._cachedSelected = [];

    this._filteredCollection = this._collection.filter(filterOutGeneratedMangoDocs);

    function filterOutGeneratedMangoDocs (doc) {
      if (doc.get && typeof doc.get === 'function') {
        return doc.get('language') !== 'query';
      }

      return doc.language !== 'query';
    }
  },

  getTypeOfIndex: function () {
    return this._typeOfIndex;
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

  getBulkDocCollection: function () {
    return this._bulkDeleteDocCollection;
  },

  setCachedOffset: function (options) {
    this._cachedOffset = options.offset;
  },

  getCachedOffset: function () {
    return this._cachedOffset;
  },

  hasCachedOffset: function () {
    return !!this._cachedOffset;
  },

  deleteCachedOffset: function () {
    delete this._cachedOffset;
  },

  getDocContent: function (originalDoc) {
    var doc = originalDoc.toJSON();

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

    return JSON.stringify(doc, null, ' ');
  },

  getMangoDoc: function (doc, index) {
    var header;

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
    if (this._selectedLayout === Constants.LAYOUT_ORIENTATION.JSON) {
      return this.getJsonViewData();
    } else {
      return this.getTableViewData();
    }
  },

  getJsonViewData: function () {
    // JSON style views
    const res = this._filteredCollection
      .map(function (doc, i) {
        if (doc.get('def') || this.isGhostDoc(doc)) {
          return this.getMangoDoc(doc, i);
        }
        return {
          content: this.getDocContent(doc),
          id: this.getDocId(doc),
          _rev: doc.get('_rev'),
          header: this.getDocId(doc),
          keylabel: doc.isFromView() ? 'key' : 'id',
          url: this.getDocId(doc) ? doc.url('app') : null,
          isDeletable: this.isDeletable(doc),
          isEditable: this.isEditable(doc)
        };
      }, this);

    return {
      displayedFields: this.getDisplayCountForTableView(),
      hasBulkDeletableDoc: this.hasBulkDeletableDoc(this._filteredCollection),
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

  normalizeTableData: function (data, isView) {
    // filter out cruft
    if (isView) {
      return data;
    }

    return data.map(function (el) {
      return el.doc || el;
    });
  },

  isIncludeDocsEnabled: function () {
    var params = app.getParams();

    return !!params.include_docs;
  },

  getPrioritizedFields: function (data, max) {
    var res = data.reduce(function (acc, el) {
      acc = acc.concat(Object.keys(el));
      return acc;
    }, []);

    res = _.countBy(res, function (el) {
      return el;
    });

    delete res.id;
    delete res._rev;

    res = Object.keys(res).reduce(function (acc, el) {
      acc.push([res[el], el]);
      return acc;
    }, []);

    res = this.sortByTwoFields(res);
    res = res.slice(0, max);

    return res.reduce(function (acc, el) {
      acc.push(el[1]);
      return acc;
    }, []);
  },

   sortByTwoFields: function (elements) {
    // given:
    // var a = [[2, "b"], [3, "z"], [1, "a"], [3, "a"]]
    // it sorts to:
    // [[3, "a"], [3, "z"], [2, "b"], [1, "a"]]
    // note that the arrays with 3 got the first two arrays
    // _and_ that the second values in the array with 3 are also sorted

    function _recursiveSort (a, b, index) {
      if (a[index] === b[index]) {
        return index < 2 ? _recursiveSort(a, b, index + 1) : 0;
      }

      // second elements asc
      if (index === 1) {
        return (a[index] < b[index]) ? -1 : 1;
      }

      // first elements desc
      return (a[index] < b[index]) ? 1 : -1;
    }

    return elements.sort(function (a, b) {
      return _recursiveSort(a, b, 0);
    });
  },

  hasIdOrRev: function (schema) {

    return schema.indexOf('_id') !== -1 ||
      schema.indexOf('id') !== -1 ||
      schema.indexOf('_rev') !== -1;
  },

  getNotSelectedFields: function (selectedFields, allFields) {
    var without = _.without.bind(this, allFields);
    return without.apply(this, selectedFields);
  },

  getDisplayCountForTableView: function () {
    var allFieldCount;
    var shownCount;

    if (!this.getIsTableView()) {
      return null;
    }

    shownCount = _.uniq(this._tableViewSelectedFields).length;
    allFieldCount = _.without(this._tableSchema, '_attachments').length;

    return {shown: shownCount, allFieldCount: allFieldCount};
  },

  getTableViewData: function () {
    // softmigration remove backbone
    const collectionType = this._collection.collectionType;
    let data = this._filteredCollection.map(el => {
      return fixDocIdForMango(el.toJSON(), collectionType);
    });

    function fixDocIdForMango (doc, docType) {
      if (docType !== 'MangoIndex') {
        return doc;
      }

      doc.id = doc.ddoc;
      return doc;
    }

    function isJSONDocEditable (doc, docType) {

      if (!doc) {
        return;
      }

      if (docType === 'MangoIndex') {
        return false;
      }

      if (!Object.keys(doc).length) {
        return false;
      }

      if (!doc._id) {
        return false;
      }

      return true;
    }

    function isJSONDocBulkDeletable (doc, docType) {
      if (docType === 'MangoIndex') {
        return doc.type !== 'special';
      }

      return !!doc._id && !!doc._rev;
    }

    // softmigration end

    let notSelectedFields = null;
    let schema;  // array containing the unique attr keys in the results.  always begins with _id.

    if (this.isIncludeDocsEnabled() || this.getIsMangoResults()) {
      const isView = !!this._collection.view;
      // remove "cruft" we don't want to display in the results
      data = this.normalizeTableData(data, isView);
      // build the schema container based on the normalized data
      schema = this.getPseudoSchema(data);

      // if we're showing a subset of the attr/columns in the table, set the selected fields
      // to the previously cached fields if they exist.
      if (!this._isPrioritizedEnabled) {
        this._tableViewSelectedFields = this._cachedSelected || [];
      }

      // if we still don't know what attr/columns to display, build the list and update the
      // cached fields for the next time.
      if (this._tableViewSelectedFields.length === 0) {
        this._tableViewSelectedFields = this.getPrioritizedFields(data, 5);
        this._cachedSelected = this._tableViewSelectedFields;
      }

      // set the notSelectedFields to the subset excluding meta and selected attributes
      const schemaWithoutMetaDataFields = _.without(schema, '_attachments');
      notSelectedFields = this.getNotSelectedFields(this._tableViewSelectedFields, schemaWithoutMetaDataFields);

      // if we're showing all attr/columns, we revert the notSelectedFields to null and set
      // the selected fields to everything excluding meta.
      if (this._isPrioritizedEnabled) {
        notSelectedFields = null;
        this._tableViewSelectedFields = schemaWithoutMetaDataFields;
      }

    } else {
      // METADATA view.
      // Build the schema based on the original data and then remove _attachment and value meta
      // attributes.
      schema = this.getPseudoSchema(data);
      this._tableViewSelectedFields = _.without(schema, '_attachments');
    }

    this._notSelectedFields = notSelectedFields;
    this._tableSchema = schema;

    const res = data.map(function (doc) {
      const safeId = app.utils.getSafeIdForDoc(doc._id || doc.id); // inconsistent apis for GET between mango and views

      return {
        content: doc,
        id: doc._id || doc.id, // inconsistent apis for GET between mango and views
        _rev: doc._rev,
        header: '',
        keylabel: '',
        url: safeId ? FauxtonAPI.urls('document', 'app', this.getDatabase().safeID(), safeId) : '',
        isDeletable: isJSONDocBulkDeletable(doc, collectionType),
        isEditable: isJSONDocEditable(doc, collectionType)
      };
    }.bind(this));

    return {
      notSelectedFields: notSelectedFields,
      selectedFields: this._tableViewSelectedFields,
      hasBulkDeletableDoc: this.hasBulkDeletableDoc(this._filteredCollection),
      schema: schema,
      results: res,
      displayedFields: this.getDisplayCountForTableView(),
    };
  },

  changeTableViewFields: function (options) {
    var newSelectedRow = options.newSelectedRow;
    var i = options.index;

    this._tableViewSelectedFields[i] = newSelectedRow;
  },

  getHasMetadata: function (schema) {
    return _.includes(schema, '_id', '_rev');
  },

  hasBulkDeletableDoc: function (docs) {
    var found = false;
    var length = docs.length;
    var i;

    // use a for loop here as we can end it once we found the first id
    for (i = 0; i < length; i++) {
      if (docs[i].isBulkDeletable()) {
        found = true;
        break;
      }
    }

    return found;
  },

  hasResults: function () {
    if (this.isLoading()) { return !this.isLoading(); }
    return this._collection.length > 0;
  },

  isLoading: function () {
    return this._isLoading;
  },

  selectDoc: function (doc) {

    if (!doc._id || doc._id === '_all_docs') {
      return;
    }

    if (!this._bulkDeleteDocCollection.get(doc._id)) {
      this._bulkDeleteDocCollection.add(doc);
      return;
    }

    this._bulkDeleteDocCollection.remove(doc._id);
  },

  selectAllDocuments: function () {
    this.deSelectCurrentCollection();

    this._collection.each(function (doc) {

      if (!doc.isBulkDeletable()) {
        return;
      }

      this.selectDoc({
        _id: doc.id,
        _rev: doc.get('_rev'),
        _deleted: true
      });
    }, this);

  },

  deSelectCurrentCollection: function () {
    this._collection.each(function (doc) {

      if (!doc.isBulkDeletable()) {
        return;
      }

      this._bulkDeleteDocCollection.remove(doc.id);
    }, this);
  },

  toggleSelectAllDocuments: function () {
    if (this.areAllDocumentsSelected()) {
      return this.deSelectCurrentCollection();
    }

    return this.selectAllDocuments();
  },

  togglePrioritizedTableView: function () {
    this._isPrioritizedEnabled = !this._isPrioritizedEnabled;
  },

  areAllDocumentsSelected: function () {
    if (this._collection.length === 0) {
      return false;
    }

    var foundAllOnThisPage = true;

    var selected = this._bulkDeleteDocCollection.pluck('_id');

    this._collection.forEach(function (doc) {
      if (!doc.isBulkDeletable()) {
        return;
      }

      if (!_.includes(selected, doc.id)) {
        foundAllOnThisPage = false;
      }
    }.bind(this));

    return foundAllOnThisPage;
  },

  getSelectedItemsLength: function () {
    return this._bulkDeleteDocCollection.length;
  },

  getDatabase: function () {
    return this._collection.database;
  },

  getTextEmptyIndex: function () {
    return this._textEmptyIndex;
  },

  hasSelectedItem: function () {
    return this.getSelectedItemsLength() > 0;
  },

  toggleLayout: function (options) {
    this._selectedLayout = options.layout;
  },

  getSelectedLayout: function () {
    return this._selectedLayout;
  },

  getIsTableView: function () {
    return this._selectedLayout === Constants.LAYOUT_ORIENTATION.TABLE;
  },

  getIsMetadataView: function () {
    return this._selectedLayout === Constants.LAYOUT_ORIENTATION.METADATA;
  },

  getIsMangoResults: function () {
    return this._typeOfIndex === 'mango' || this._typeOfIndex === 'mango-index';
  },

  getIsMangoIndexResults: function () {
    return this._typeOfIndex === 'mango-index';
  },

  getIsPrioritizedEnabled: function () {
    return this._isPrioritizedEnabled;
  },

  getCurrentViewType: function () {

    if (this._tableView) {
      return 'table';
    }

    return 'expanded';
  },

  getShowPrioritizedFieldToggler: function () {
    return (this.isIncludeDocsEnabled() || this.getIsMangoResults()) && this.getIsTableView();
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
        this.selectDoc(action.options);
      break;
      case ActionTypes.INDEX_RESULTS_CLEAR_RESULTS:
        this.clearResultsBeforeFetch();
      break;
      case ActionTypes.INDEX_RESULTS_TOOGLE_SELECT_ALL_DOCUMENTS:
        this.toggleSelectAllDocuments();
      break;
      case ActionTypes.INDEX_RESULTS_SELECT_NEW_FIELD_IN_TABLE:
        this.changeTableViewFields(action.options);
      break;
      case ActionTypes.INDEX_RESULTS_TOGGLE_PRIORITIZED_TABLE_VIEW:
        this.togglePrioritizedTableView();
      break;

      case HeaderActionTypes.TOGGLE_LAYOUT:
        this.toggleLayout(action.options);
      break;

      case PaginationActionTypes.SET_PAGINATION_DOCUMENT_LIMIT:
        this.setDocumentLimit(action.docLimit);
      break;
      case PaginationActionTypes.PAGINATE_NEXT:
        this.paginateNext();
      break;
      case PaginationActionTypes.PAGINATE_PREVIOUS:
        this.paginatePrevious();
      break;
      case PaginationActionTypes.PER_PAGE_CHANGE:
        this.resetPagination();
        this.setPerPage(action.perPage);
      break;
      case PaginationActionTypes.SET_CACHED_OFFSET:
        this.setCachedOffset(action.options);
      break;
      case PaginationActionTypes.DELETE_CACHED_OFFSET:
        this.deleteCachedOffset();
      break;
      case PaginationActionTypes.SET_PAGE_START:
        this.setPageStart(action.options);
      break;
      case PaginationActionTypes.RESET_PAGINATION:
        this.resetPagination();
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

export default Stores;
