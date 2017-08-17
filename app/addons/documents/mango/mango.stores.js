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
import ActionTypes from "./mango.actiontypes";
import IndexActionTypes from "../index-results/actiontypes";

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

const HISTORY_LIMIT = 5;

Stores.MangoStore = FauxtonAPI.Store.extend({

  initialize: function () {
    this.setHistoryKey('default');
    this._queryIndexCode = defaultQueryIndexCode;
  },

  getQueryIndexCode: function () {
    return this.formatCode(this._queryIndexCode);
  },

  setQueryIndexCode: function (options) {
    this._queryIndexCode = options.code;
  },

  getQueryFindCode: function () {
    return this.getHistory()[0].value;
  },

  formatCode: function (code) {
    return JSON.stringify(code, null, 3);
  },

  setDatabase: function (options) {
    this._database = options.database;
    this.setHistoryKey(options.database.id);
  },

  getDatabase: function () {
    return this._database;
  },

  setExplainPlan: function (options) {
    this._explainPlan = options && options.explainPlan;
  },

  getExplainPlan: function() {
    return this._explainPlan;
  },

  getHistoryKey: function() {
    return this._historyKey;
  },

  setHistoryKey: function(key) {
    this._historyKey = key + '_queryhistory';
  },

  createHistoryEntry: function(queryObject) {
    // ensure we're working with a deserialized query object
    const object = typeof queryObject === "string" ? JSON.parse(queryObject) : queryObject;

    const singleLineValue = JSON.stringify(object);
    const multiLineValue = this.formatCode(object);

    return {
      label: singleLineValue,
      value: multiLineValue,
      className: 'mango-history-entry'
    };
  },

  addQueryHistory: function (value, label) {
    var history = this.getHistory();

    const historyEntry = this.createHistoryEntry(value);
    historyEntry.label = label || historyEntry.label;

    // remove existing entry if it exists
    var indexOfExisting = history.findIndex(i => i.value === historyEntry.value);
    if (indexOfExisting > -1) {
      history.splice(indexOfExisting, 1);
    }

    // insert item at head of array
    history.splice(0, 0, historyEntry);

    // limit array length
    if (history.length > HISTORY_LIMIT) {
      history.splice(HISTORY_LIMIT, 1);
    }

    app.utils.localStorageSet(this.getHistoryKey(), history);
  },

  getDefaultHistory: function () {
    return [this.createHistoryEntry(defaultQueryFindCode)];
  },

  getHistory: function () {
    return app.utils.localStorageGet(this.getHistoryKey()) || this.getDefaultHistory();
  },

  dispatch: function (action) {
    switch (action.type) {

      case ActionTypes.MANGO_SET_DB:
        this.setDatabase(action.options);
      break;

      case ActionTypes.MANGO_NEW_QUERY_CREATE_INDEX_CODE:
        this.setQueryIndexCode(action.options);
      break;

      case ActionTypes.MANGO_NEW_QUERY_FIND_CODE:
        this.addQueryHistory(action.options.code);
      break;

      case ActionTypes.MANGO_EXPLAIN_RESULTS:
        this.setExplainPlan(action.options);
        break;

      case IndexActionTypes.INDEX_RESULTS_CLEAR_RESULTS:
        this.setExplainPlan(false);
        break;
    }

    this.triggerChange();
  }

});

Stores.mangoStore = new Stores.MangoStore();

Stores.mangoStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.mangoStore.dispatch);

export default Stores;
