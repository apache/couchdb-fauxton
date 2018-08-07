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

import FauxtonAPI from "../../../core/api";
import ActionTypes from "./actiontypes";
import Resources from "../resources";
var Stores = {};

Stores.IndexEditorStore = FauxtonAPI.Store.extend({

  defaultMap: 'function (doc) {\n  emit(doc._id, 1);\n}',
  defaultReduce: 'function (keys, values, rereduce) {\n  if (rereduce) {\n    return sum(values);\n  } else {\n    return values.length;\n  }\n}',

  initialize: function () {
    this.reset();
  },

  reset: function () {
    this._designDocs = [];
    this._isLoading = true;
    this._view = { reduce: '', map: this.defaultMap };
    this._database = { id: '0' };
  },

  editIndex: function (options) {
    this._database = options.database;
    this._newView = options.newView;
    this._viewName = options.viewName || 'viewName';
    this._newDesignDoc = options.newDesignDoc || false;
    this._newDesignDocName = '';
    this._designDocs = options.designDocs;
    this._designDocId = options.designDocId;
    this._originalViewName = this._viewName;
    this._originalDesignDocName = options.designDocId;
    this.setView();

    this._isLoading = false;
  },

  isLoading: function () {
    return this._isLoading;
  },

  setView: function () {
    if (this._newView || this._newDesignDoc) {
      this._view = { reduce: '', map: this.defaultMap };
    } else {
      this._view = this.getDesignDoc().get('views')[this._viewName];
    }
  },

  getDatabase: function () {
    return this._database;
  },

  getMap: function () {
    return this._view.map;
  },

  setMap: function (map) {
    this._view.map = map;
  },

  getReduce: function () {
    return this._view.reduce;
  },

  setReduce: function (reduce) {
    this._view.reduce = reduce;
  },

  getDesignDoc: function () {
    return this._designDocs.find((ddoc) => {
      return this._designDocId == ddoc.id;
    }).dDocModel();
  },

  getDesignDocs: function () {
    return this._designDocs;
  },

  // returns a simple array of design doc IDs. Omits mango docs
  getAvailableDesignDocs: function () {
    var availableDocs = this.getDesignDocs().filter(function (doc) {
      return !doc.isMangoDoc();
    });
    return _.map(availableDocs, function (doc) {
      return doc.id;
    });
  },

  getDesignDocId: function () {
    return this._designDocId;
  },

  setDesignDocId: function (designDocId) {
    this._designDocId = designDocId;
  },

  isNewDesignDoc: function () {
    return this._newDesignDoc;
  },

  isNewView: function () {
    return this._newView;
  },

  getViewName: function () {
    return this._viewName;
  },

  setViewName: function (name) {
    this._viewName = name;
  },

  hasCustomReduce: function () {
    if (!this.hasReduce()) {
      return false;
    }
    return !_.includes(this.builtInReduces(), this.getReduce());
  },

  hasReduce: function () {
    if (!this.getReduce()) {
      return false;
    }
    return true;
  },

  getOriginalViewName: function () {
    return this._originalViewName;
  },

  getOriginalDesignDocName: function () {
    return this._originalDesignDocName;
  },

  builtInReduces: function () {
    return ['_sum', '_count', '_stats'];
  },

  reduceSelectedOption: function () {
    if (!this.hasReduce()) {
      return 'NONE';
    }
    if (this.hasCustomReduce()) {
      return 'CUSTOM';
    }
    return this.getReduce();
  },

  reduceOptions: function () {
    return this.builtInReduces().concat(['CUSTOM', 'NONE']);
  },

  updateReduceFromSelect: function (selectedReduce) {
    if (selectedReduce === 'NONE') {
      this.setReduce(null);
      return;
    }
    if (selectedReduce === 'CUSTOM') {
      this.setReduce(this.defaultReduce);
      return;
    }
    this.setReduce(selectedReduce);
  },

  addDesignDoc: function (designDoc) {
    this._designDocs.add(designDoc, { merge: true });
    this._designDocId = designDoc._id;
  },

  getNewDesignDocName: function () {
    return this._newDesignDocName;
  },

  getSaveDesignDoc: function () {
    if (this._designDocId === 'new-doc') {
      var doc = {
        _id: '_design/' + this._newDesignDocName,
        views: {},
        language: 'javascript'
      };
      return new Resources.Doc(doc, { database: this._database });
    }

    var foundDoc = this._designDocs.find(function (ddoc) {
      return ddoc.id === this._designDocId;
    }.bind(this));

    return (!foundDoc) ? null : foundDoc.dDocModel();
  },

  dispatch: function (action) {
    switch (action.type) {
      case ActionTypes.CLEAR_INDEX:
        this.reset();
        break;

      case ActionTypes.EDIT_INDEX:
        this.editIndex(action.options);
        break;

      case ActionTypes.VIEW_NAME_CHANGE:
        this.setViewName(action.name);
        break;

      case ActionTypes.EDIT_NEW_INDEX:
        this.editIndex(action.options);
        break;

      case ActionTypes.SELECT_REDUCE_CHANGE:
        this.updateReduceFromSelect(action.reduceSelectedOption);
        break;

      case ActionTypes.DESIGN_DOC_CHANGE:
        this.setDesignDocId(action.options.value);
        break;

      case ActionTypes.VIEW_SAVED:
        break;

      case ActionTypes.VIEW_CREATED:
        break;

      case ActionTypes.VIEW_ADD_DESIGN_DOC:
        this.addDesignDoc(action.designDoc);
        this.setView();
        break;

      case ActionTypes.VIEW_UPDATE_MAP_CODE:
        this.setMap(action.code);
        break;

      case ActionTypes.VIEW_UPDATE_REDUCE_CODE:
        this.setReduce(action.code);
        break;

      case ActionTypes.DESIGN_DOC_NEW_NAME_UPDATED:
        this._newDesignDocName = action.options.value;
        break;

      default:
        return;
    }

    this.triggerChange();
  }

});

Stores.indexEditorStore = new Stores.IndexEditorStore();
Stores.indexEditorStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.indexEditorStore.dispatch.bind(Stores.indexEditorStore));

export default Stores;
