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
import Stores from "./stores";
const store = Stores.queryOptionsStore;

export default {

  toggleIncludeDocs: function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_TOGGLE_INCLUDE_DOCS
    });
  },

  toggleByKeys: function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_TOGGLE_BY_KEYS
    });
  },

  toggleBetweenKeys: function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_TOGGLE_BETWEEN_KEYS
    });
  },

  toggleDescending: function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_TOGGLE_DESCENDING
    });
  },

  toggleReduce: function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_TOGGLE_REDUCE
    });
  },

  updateBetweenKeys: function (betweenKeys) {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_UPDATE_BETWEEN_KEYS,
      betweenKeys: betweenKeys
    });
  },

  updateByKeys: function (byKeys) {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_UPDATE_BY_KEYS,
      byKeys: byKeys
    });
  },

  updateSkip: function (skip) {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_UPDATE_SKIP,
      skip: skip
    });
  },

  updateLimit: function (limit) {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_UPDATE_LIMIT,
      limit: limit
    });
  },

  runQuery: function (params) {
    var url = app.utils.replaceQueryParams(params);
    FauxtonAPI.navigate(url);
  },

  toggleQueryBarVisibility: function (options) {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_UPDATE_VISIBILITY,
      options: options
    });
  },

  updateGroupLevel: function (groupLevel) {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_UPDATE_GROUP_LEVEL,
      groupLevel: groupLevel
    });
  },

  reset: function (options) {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_RESET,
      params: options.queryParams
    });

    if (options.showReduce) {
      FauxtonAPI.dispatch({
        type: ActionTypes.QUERY_SHOW_REDUCE
      });
    }
  },

  showQueryOptions: function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_SHOW
    });
  },

  hideQueryOptions: function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.QUERY_HIDE
    });
  }
};
