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
  'addons/databases/actiontypes',
  'addons/databases/resources'
], function (app, FauxtonAPI, ActionTypes, Resources) {

  var DatabasesStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._collection = new Backbone.Collection();
      this._loading = false;
      this._promptVisible = false;
    },

    init: function (collection, backboneCollection) {
      this._collection = collection;
      this._backboneCollection = backboneCollection;
    },

    setPage: function (page) {
      this._page = page;
    },

    getPage: function () {
      if (this._page) {
        return this._page;
      } else {
        return 1;
      }
    },

    isLoading: function () {
      return this._loading;
    },

    setLoading: function (loading) {
      this._loading = loading;
    },

    isPromptVisible: function () {
      return this._promptVisible;
    },

    setPromptVisible: function (promptVisible) {
      this._promptVisible = promptVisible;
    },

    obtainNewDatabaseModel: function (databaseName, nameAccCallback) {
      return new this._backboneCollection.model({
        id: databaseName,
        name: databaseName
      });
    },

    getCollection: function () {
      return this._collection;
    },

    getDatabaseNames: function () {
      if (this._backboneCollection) {
        return _.map(this._backboneCollection.toJSON(), function (item, key) {
          return item.name;
        });
      } else {
        return [];
      }
    },

    doesDatabaseExist: function (databaseName) {
      return this.getDatabaseNames().indexOf(databaseName) >= 0;
    },

    dispatch: function (action) {
      switch (action.type) {

        case ActionTypes.DATABASES_INIT:
          this.init(action.options.collection, action.options.backboneCollection);
          this.setPage(action.options.page);
          this.setLoading(false);
          this.triggerChange();
        break;

        case ActionTypes.DATABASES_SETPAGE:
          this.setPage(action.options.page);
          this.triggerChange();
        break;

        case ActionTypes.DATABASES_SET_PROMPT_VISIBLE:
          this.setPromptVisible(action.options.visible);
          this.triggerChange();
        break;

        case ActionTypes.DATABASES_STARTLOADING:
          this.setLoading(true);
          this.triggerChange();
        break;

        case ActionTypes.DATABASES_LOADCOMPLETE:
          this.setLoading(false);
          this.triggerChange();
        break;

        default:
        return;
      }
    }
  });

  var databasesStore = new DatabasesStore();
  databasesStore.dispatchToken = FauxtonAPI.dispatcher.register(databasesStore.dispatch.bind(databasesStore));
  return {
    databasesStore: databasesStore
  };

});
