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
      this._selectedTab = 'all-docs';
      this._loading = true;
      this._toggledSections = {};
    },

    newOptions: function (options) {
      this._database = options.database;
      this._designDocs = options.designDocs;
      this._loading = false;

      if (options.selectedTab) {
        this.setSelectedTab(options.selectedTab);
      }
    },

    isLoading: function () {
      return this._loading;
    },

    getDatabase: function () {
      if (this.isLoading()) {return {};}

      return this._database;
    },

    toggleContent: function (designDoc, index) {
      if (!this._toggledSections[designDoc]) {
        this._toggledSections[designDoc] = {
          visible: true,
          indexes: {}
        };
        return;
      }

      if (index) {
        return this.toggleIndex(designDoc, index);
      }

      this._toggledSections[designDoc].visible = !this._toggledSections[designDoc].visible;
    },

    toggleIndex: function (designDoc, indexName) {
      var index = this._toggledSections[designDoc].indexes[indexName];

      if (_.isUndefined(index)) {
        this._toggledSections[designDoc].indexes[indexName] = true;
        return;
      }

      this._toggledSections[designDoc].indexes[indexName] = !index;
    },

    isVisible: function (designDoc, index) {
      if (!this._toggledSections[designDoc]) {
        return false;
      }

      if (index) {
        return this._toggledSections[designDoc].indexes[index];
      }

      return this._toggledSections[designDoc].visible;
    },

    setSelectedTab: function (tab) {
      this._selectedTab = tab;
    },

    getDatabaseName: function () {
      if (this.isLoading()) { return '';}

      return this._database.safeID();
    },

    getDesignDocs: function () {
      if (this.isLoading()) { return {};}
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

    getSelectedTab: function () {
      return this._selectedTab;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.SIDEBAR_SET_SELECTED_TAB:
          this.setSelectedTab(action.tab);
          this.triggerChange();
        break;
        case ActionTypes.SIDEBAR_NEW_OPTIONS:
          this.newOptions(action.options);
          this.triggerChange();
        break;
        case ActionTypes.SIDEBAR_TOGGLE_CONTENT:
          this.toggleContent(action.designDoc, action.index);
          this.triggerChange();
        break;
        case ActionTypes.SIDEBAR_FETCHING:
          this._loading = true;
          this.triggerChange();
        break;
        default:
        return;
        // do nothing
      }
    }

  });

  Stores.sidebarStore = new Stores.SidebarStore();

  Stores.sidebarStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.sidebarStore.dispatch);

  return Stores;

});
