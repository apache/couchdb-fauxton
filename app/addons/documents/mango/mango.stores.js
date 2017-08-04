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

Stores.MangoStore = FauxtonAPI.Store.extend({

  initialize: function () {
    this._queryFindCode = defaultQueryFindCode;
    this._queryIndexCode = defaultQueryIndexCode;
    this._queryFindCodeChanged = false;
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

  formatCode: function (code) {
    return JSON.stringify(code, null, '  ');
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

  setExplainPlan: function (options) {
    this._explainPlan = options && options.explainPlan;
  },

  getExplainPlan: function() {
    return this._explainPlan;
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
        this.setQueryFindCode(action.options);
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
