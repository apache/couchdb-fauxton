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
  'addons/documents/actiontypes'
],

function(FauxtonAPI, ActionTypes) {
  var Stores = {};

  Stores.IndexEditorStore = FauxtonAPI.Store.extend({

    defaultMap: 'function(doc) {\n  emit(doc._id, 1);\n}',
    defaultReduce: 'function(keys, values, rereduce){\n  if (rereduce){\n    return sum(values);\n  } else {\n    return values.length;\n  }\n}',

    editIndex: function (options) {
      this._database = options.database;
      this._newView = options.newView;
      this._newDesignDoc = options.newDesignDoc || false;
      this._viewName = options.viewName || 'viewName';
      this._designDocs = options.designDocs;
      this._designDocId = options.designDocId;
      this._showEditor = this._newView;
      this._designDocChanged = false;

      if (!this._newView && !this._newDesignDoc) {
        this._view = this.getDesignDoc().get('views')[this._viewName];
      } else {
        this._view = {
          reduce: '',
          map: ''
        };
      }
    },

    getDatabase: function () {
      return this._database;
    },

    getMap: function () {
      if (this._newView) {
        return this.defaultMap;
      }

      return this._view.map;
    },

    getReduce: function () {
      return this._view.reduce;
    },

    setReduce: function (reduce) {
      this._view.reduce = reduce;
    },

    getDesignDoc: function () {
      return this._designDocs.find(function (ddoc) {
        return this._designDocId == ddoc.id;
      }, this).dDocModel();

    },

    getDesignDocs: function () {
      return this._designDocs;
    },

    getDesignDocId: function () {
      return this._designDocId;
    },

    setDesignDocId: function (designDocId, newDesignDoc) {
      this._designDocId = designDocId;
      this._newDesignDoc = newDesignDoc;
      this._designDocChanged = true;
    },

    hasDesignDocChanged: function () {
      return this._designDocChanged;
    },

    isNewDesignDoc: function () {
      return this._newDesignDoc;
    },

    isNewView: function () {
      return this._newView;
    },

    getTitle: function () {
      return this._newView ? 'Create Index' : 'Edit Index';
    },

    getViewName: function () {
      return this._viewName;
    },

    showEditor: function () {
      return this._showEditor;
    },

    hasCustomReduce: function () {
      if (!this.hasReduce()) {return false; }

      return !_.contains(this.builtInReduces(), this.getReduce());
    },

    hasReduce: function () {
      if (!this.getReduce()) { return false; }

      return true;
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

    dispatch: function (action) {
      switch(action.type) {
        case ActionTypes.EDIT_INDEX:
          this.editIndex(action.options);
          this.triggerChange();
        break;

        case ActionTypes.EDIT_NEW_INDEX:
          this.editIndex(action.options);
          this.triggerChange();
        break;

        case ActionTypes.TOGGLE_EDITOR:
          this._showEditor = !this._showEditor;
          this.triggerChange();
        break;

        case ActionTypes.SELECT_REDUCE_CHANGE:
          this.updateReduceFromSelect(action.reduceSelectedOption);
          this.triggerChange();
        break;

        case ActionTypes.DESIGN_DOC_CHANGE:
          this.setDesignDocId(action.designDocId, action.newDesignDoc); 
          this.triggerChange();
        break;

        case ActionTypes.NEW_DESIGN_DOC:
          this.setDesignDocId('', true); 
          this.triggerChange();
        break;

        case ActionTypes.VIEW_SAVED:
          this.triggerChange();
        break;

        default:
          return;
        // do nothing
      }
    }

  });

  Stores.indexEditorStore = new Stores.IndexEditorStore();

  Stores.indexEditorStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.indexEditorStore.dispatch);

  return Stores;

});
