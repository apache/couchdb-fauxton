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
  'addons/documents/sidebar/actiontypes'
],

function (app, FauxtonAPI, ActionTypes) {
  var Stores = {};

  Stores.SidebarStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this._selected = {
        navItem: 'all-docs',
        designDocName: '',
        designDocSection: '', // metadata / name of index group ("Views", etc.)
        indexName: ''
      };
      this._loading = true;
      this._toggledSections = {};
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

        case ActionTypes.SIDEBAR_REFRESH:
        break;

        default:
        return;
        // do nothing
      }

      this.triggerChange();
    }

  });

  Stores.sidebarStore = new Stores.SidebarStore();
  Stores.sidebarStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.sidebarStore.dispatch);

  return Stores;

});
