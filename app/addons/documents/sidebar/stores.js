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
import React from "react";
import ActionTypes from "./actiontypes";
var Stores = {};

Stores.SidebarStore = FauxtonAPI.Store.extend({

  initialize: function () {
    this.reset();
  },

  reset: function () {
    this._designDocs = new Backbone.Collection();
    this._selected = {
      navItem: 'all-docs',
      designDocName: '',
      designDocSection: '', // 'metadata' / name of index group ("Views", etc.)
      indexName: ''
    };
    this._loading = true;
    this._toggledSections = {};

    this._deleteIndexModalVisible = false;
    this._deleteIndexModalDesignDocName = '';
    this._deleteIndexModalText = '';
    this._deleteIndexModalIndexName = '';
    this._deleteIndexModalOnSubmit = function () { };

    this._cloneIndexModalVisible = false;
    this._cloneIndexDesignDocProp = '';
    this._cloneIndexModalTitle = '';
    this._cloneIndexModalSelectedDesignDoc = '';
    this._cloneIndexModalNewDesignDocName = '';
    this._cloneIndexModalNewIndexName = '';
    this._cloneIndexModalIndexLabel = '';
    this._cloneIndexModalOnSubmit = function () { };
  },

  newOptions: function (options) {
    this._database = options.database;
    this._designDocs = options.designDocs;
    this._loading = false;

    // this can be expanded in future as we need. Right now it can only set a top-level nav item ('all docs',
    // 'permissions' etc.) and not a nested page
    if (options.selectedNavItem) {
      this._selected = {
        navItem: options.selectedNavItem,
        designDocName: '',
        designDocSection: '',
        indexName: ''
      };
    }
  },

  updatedDesignDocs: function (designDocs) {
    this._designDocs = designDocs;
  },

  isDeleteIndexModalVisible: function () {
    return this._deleteIndexModalVisible;
  },

  getDeleteIndexModalText: function () {
    return this._deleteIndexModalText;
  },

  getDeleteIndexModalOnSubmit: function () {
    return this._deleteIndexModalOnSubmit;
  },

  isLoading: function () {
    return this._loading;
  },

  getDatabase: function () {
    if (this.isLoading()) {
      return {};
    }
    return this._database;
  },

  // used to toggle both design docs, and any index groups within them
  toggleContent: function (designDoc, indexGroup) {
    if (!this._toggledSections[designDoc]) {
      this._toggledSections[designDoc] = {
        visible: true,
        indexGroups: {}
      };
      return;
    }

    if (indexGroup) {
      return this.toggleIndexGroup(designDoc, indexGroup);
    }

    this._toggledSections[designDoc].visible = !this._toggledSections[designDoc].visible;
  },

  toggleIndexGroup: function (designDoc, indexGroup) {
    var expanded = this._toggledSections[designDoc].indexGroups[indexGroup];

    if (_.isUndefined(expanded)) {
      this._toggledSections[designDoc].indexGroups[indexGroup] = true;
      return;
    }

    this._toggledSections[designDoc].indexGroups[indexGroup] = !expanded;
  },

  isVisible: function (designDoc, indexGroup) {
    if (!this._toggledSections[designDoc]) {
      return false;
    }
    if (indexGroup) {
      return this._toggledSections[designDoc].indexGroups[indexGroup];
    }
    return this._toggledSections[designDoc].visible;
  },

  getSelected: function () {
    return this._selected;
  },

  setSelected: function (params) {
    this._selected = {
      navItem: params.navItem,
      designDocName: params.designDocName,
      designDocSection: params.designDocSection,
      indexName: params.indexName
    };

    if (params.designDocName) {
      if (!_.has(this._toggledSections, params.designDocName)) {
        this._toggledSections[params.designDocName] = { visible: true, indexGroups: {} };
      }
      this._toggledSections[params.designDocName].visible = true;

      if (params.designDocSection) {
        this._toggledSections[params.designDocName].indexGroups[params.designDocSection] = true;
      }
    }
  },

  getToggledSections: function () {
    return this._toggledSections;
  },

  getDatabaseName: function () {
    if (this.isLoading()) {
      return '';
    }
    return this._database.safeID();
  },

  getDesignDocs: function () {
    return this._designDocs;
  },

  // returns a simple array of design doc IDs
  getAvailableDesignDocs: function () {
    var availableDocs = this.getDesignDocs().filter(function (doc) {
      return !doc.isMangoDoc();
    });
    return _.map(availableDocs, function (doc) {
      return doc.id;
    });
  },

  getDesignDocList: function () {
    if (this.isLoading()) {
      return {};
    }
    var docs = this._designDocs.toJSON();

    docs = _.filter(docs, function (doc) {
      if (_.has(doc.doc, 'language')) {
        return doc.doc.language !== 'query';
      }
      return true;
    });

    return docs.map(function (doc) {
      doc.safeId = app.utils.safeURLName(doc._id.replace(/^_design\//, ""));
      return _.extend(doc, doc.doc);
    });
  },

  showDeleteIndexModal: function (params) {
    this._deleteIndexModalIndexName = params.indexName;
    this._deleteIndexModalDesignDocName = params.designDocName;
    this._deleteIndexModalVisible = true;
    this._deleteIndexModalText = (<div>Are you sure you want to delete the <code>{this._deleteIndexModalIndexName}</code> {params.indexLabel}?</div>);
    this._deleteIndexModalOnSubmit = params.onDelete;
  },

  getDeleteIndexModalIndexName: function () {
    return this._deleteIndexModalIndexName;
  },

  getDeleteIndexDesignDoc: function () {
    var designDoc = this._designDocs.find((ddoc) => {
      return '_design/' + this._deleteIndexModalDesignDocName === ddoc.id;
    });

    return (designDoc) ? designDoc.dDocModel() : null;
  },

  isCloneIndexModalVisible: function () {
    return this._cloneIndexModalVisible;
  },

  getCloneIndexModalTitle: function () {
    return this._cloneIndexModalTitle;
  },

  showCloneIndexModal: function (params) {
    this._cloneIndexModalIndexLabel = params.indexLabel;
    this._cloneIndexModalTitle = params.cloneIndexModalTitle;
    this._cloneIndexModalSourceIndexName = params.sourceIndexName;
    this._cloneIndexModalSourceDesignDocName = params.sourceDesignDocName;
    this._cloneIndexModalSelectedDesignDoc = '_design/' + params.sourceDesignDocName;
    this._cloneIndexDesignDocProp = '';
    this._cloneIndexModalVisible = true;
    this._cloneIndexModalOnSubmit = params.onSubmit;
  },

  getCloneIndexModalIndexLabel: function () {
    return this._cloneIndexModalIndexLabel;
  },

  getCloneIndexModalOnSubmit: function () {
    return this._cloneIndexModalOnSubmit;
  },

  getCloneIndexModalSourceIndexName: function () {
    return this._cloneIndexModalSourceIndexName;
  },

  getCloneIndexModalSourceDesignDocName: function () {
    return this._cloneIndexModalSourceDesignDocName;
  },

  getCloneIndexDesignDocProp: function () {
    return this._cloneIndexDesignDocProp;
  },

  getCloneIndexModalSelectedDesignDoc: function () {
    return this._cloneIndexModalSelectedDesignDoc;
  },

  getCloneIndexModalNewDesignDocName: function () {
    return this._cloneIndexModalNewDesignDocName;
  },

  getCloneIndexModalNewIndexName: function () {
    return this._cloneIndexModalNewIndexName;
  },

  dispatch: function (action) {
    switch (action.type) {
      case ActionTypes.SIDEBAR_SET_SELECTED_NAV_ITEM:
        this.setSelected(action.options);
        break;

      case ActionTypes.SIDEBAR_NEW_OPTIONS:
        this.newOptions(action.options);
        break;

      case ActionTypes.SIDEBAR_TOGGLE_CONTENT:
        this.toggleContent(action.designDoc, action.indexGroup);
        break;

      case ActionTypes.SIDEBAR_FETCHING:
        this._loading = true;
        break;

      case ActionTypes.SIDEBAR_SHOW_DELETE_INDEX_MODAL:
        this.showDeleteIndexModal(action.options);
        break;

      case ActionTypes.SIDEBAR_HIDE_DELETE_INDEX_MODAL:
        this._deleteIndexModalVisible = false;
        break;

      case ActionTypes.SIDEBAR_SHOW_CLONE_INDEX_MODAL:
        this.showCloneIndexModal(action.options);
        break;

      case ActionTypes.SIDEBAR_HIDE_CLONE_INDEX_MODAL:
        this._cloneIndexModalVisible = false;
        break;

      case ActionTypes.SIDEBAR_CLONE_MODAL_DESIGN_DOC_CHANGE:
        this._cloneIndexModalSelectedDesignDoc = action.options.value;
        break;

      case ActionTypes.SIDEBAR_CLONE_MODAL_DESIGN_DOC_NEW_NAME_UPDATED:
        this._cloneIndexModalNewDesignDocName = action.options.value;
        break;

      case ActionTypes.SIDEBAR_CLONE_MODAL_UPDATE_INDEX_NAME:
        this._cloneIndexModalNewIndexName = action.options.value;
        break;

      case ActionTypes.SIDEBAR_UPDATED_DESIGN_DOCS:
        this.updatedDesignDocs(action.options.designDocs);
        this._loading = false;
        break;

      default:
        return;
      // do nothing
    }

    this.triggerChange();
  }

});

Stores.sidebarStore = new Stores.SidebarStore();
Stores.sidebarStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.sidebarStore.dispatch.bind(Stores.sidebarStore));

export default Stores;
