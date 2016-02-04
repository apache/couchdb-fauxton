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
  '../../../core/api',
  './mango.actiontypes'
],

function (FauxtonAPI, ActionTypes) {


  var defaultQueryIndexCode = {
    "index": {
      "fields": ["_id"]
    },
    "type" : "json"
  };

  var defaultQueryFindCode = {
    "selector": {
      "_id": {"$gt": null}
    }
  };

  var Stores = {};

  Stores.MangoStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this._queryFindCode = defaultQueryFindCode;
      this._queryIndexCode = defaultQueryIndexCode;
      this._queryFindCodeChanged = false;
      this._availableIndexes = [];
      this._getLoadingIndexes = true;
    },

    getQueryIndexCode: function () {
      return this.formatCode(this._queryIndexCode);
    },

    setQueryIndexCode: function (options) {
      this._queryIndexCode = options.code;
    },

    getQueryFindCode: function () {
      return this.formatCode(this._queryFindCode);
    },

    setQueryFindCode: function (options) {
      this._queryFindCode = options.code;
    },

    getLoadingIndexes: function () {
      return this._getLoadingIndexes;
    },

    setLoadingIndexes: function (options) {
      this._getLoadingIndexes = options.isLoading;
    },

    formatCode: function (code) {
      return JSON.stringify(code, null, '  ');
    },

    newQueryFindCodeFromFields: function (options) {
      var fields = options.fields,
          queryCode = JSON.parse(JSON.stringify(this._queryFindCode)),
          selectorContent;

      if (!fields) {
        return;
      }

      selectorContent = fields.reduce(function (acc, field) {
        acc[field] = {"$gt": null};
        return acc;
      }, {});

      queryCode.selector = selectorContent;
      this._queryFindCode = queryCode;
      this._queryFindCodeChanged = true;
    },

    getQueryFindCodeChanged: function () {
      return this._queryFindCodeChanged;
    },

    setDatabase: function (options) {
      this._database = options.database;
    },

    getDatabase: function () {
      return this._database;
    },

    setAvailableIndexes: function (options) {
      this._availableIndexes = options.indexList;
    },

    getAvailableQueryIndexes: function () {
      return this._availableIndexes.filter(function (el) {
        return ['json', 'special'].indexOf(el.get('type')) !== -1;
      });
    },

    getAvailableAdditionalIndexes: function () {
      var indexes = FauxtonAPI.getExtensions('mango:additionalIndexes')[0];

      if (!indexes) {
        return;
      }

      return this._availableIndexes.filter(function (el) {
        return el.get('type').indexOf(indexes.type) !== -1;
      });
    },

    dispatch: function (action) {
      switch (action.type) {

        case ActionTypes.MANGO_SET_DB:
          this.setDatabase(action.options);
        break;

        case ActionTypes.MANGO_NEW_QUERY_CREATE_INDEX_CODE:
          this.setQueryIndexCode(action.options);
        break;

        case ActionTypes.MANGO_NEW_QUERY_FIND_CODE_FROM_FIELDS:
          this.newQueryFindCodeFromFields(action.options);
        break;

        case ActionTypes.MANGO_NEW_QUERY_FIND_CODE:
          this.setQueryFindCode(action.options);
        break;

        case ActionTypes.MANGO_NEW_AVAILABLE_INDEXES:
          this.setAvailableIndexes(action.options);
        break;

        case ActionTypes.MANGO_RESET:
          this.setLoadingIndexes(action.options);
        break;
      }

      this.triggerChange();
    }

  });

  Stores.mangoStore = new Stores.MangoStore();

  Stores.mangoStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.mangoStore.dispatch);

  return Stores;

});
