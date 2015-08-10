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
  'addons/documents/queryoptions/actiontypes',
  'addons/documents/queryoptions/stores'
],
function (app, FauxtonAPI, ActionTypes, Stores) {
  var store = Stores.queryOptionsStore;
  return {

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

    toggleUpdateSeq: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.QUERY_TOGGLE_UPDATE_SEQ
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

      if (options.showStale) {
        FauxtonAPI.dispatch({
          type: ActionTypes.QUERY_SHOW_STALE
        });
      }
    }

  };
});
