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
import * as IndexResultActions from "../index-results/actions/fetch";
import * as MangoAPI from "./mango.api";

export default {

  loadQueryHistory: function (options) {
    return {
      type: ActionTypes.MANGO_LOAD_QUERY_HISTORY,
      options: options
    };
  },

  newQueryFindCode: function (options) {
    return {
      type: ActionTypes.MANGO_NEW_QUERY_FIND_CODE,
      options: options
    };
  },

  showQueryExplain: function (options) {
    return {
      type: ActionTypes.MANGO_SHOW_EXPLAIN_RESULTS,
      options: options
    };
  },

  hideQueryExplain: function () {
    return {
      type: ActionTypes.MANGO_HIDE_EXPLAIN_RESULTS
    };
  },

  newQueryCreateIndexTemplate: function (options) {
    return {
      type: ActionTypes.MANGO_NEW_QUERY_CREATE_INDEX_TEMPLATE,
      options: options
    };
  },

  loadIndexTemplates: function (options) {
    return {
      type: ActionTypes.MANGO_LOAD_INDEX_TEMPLATES,
      options: options
    };
  },

  requestSaveIndex: function () {
    return {
      type: ActionTypes.MANGO_SAVE_INDEX_REQUEST
    };
  },

  saveIndex: function ({ databaseName, indexCode, fetchParams }) {
    FauxtonAPI.addNotification({
      msg: 'Saving index for query...',
      type: 'info',
      clear: true
    });

    return (dispatch) => {
      // Notifies index save operation was requested
      dispatch(this.requestSaveIndex());

      return MangoAPI.createIndex(databaseName, indexCode)
        .then(() => {
          const runQueryURL = '#' + FauxtonAPI.urls('mango', 'query-app',
            app.utils.safeURLName(databaseName), '');

          const queryIndexes = (params) => { return MangoAPI.fetchIndexes(databaseName, params); };
          dispatch(IndexResultActions.fetchDocs(queryIndexes, fetchParams, {}));

          FauxtonAPI.addNotification({
            msg: 'Index is ready for querying. <a href="' + runQueryURL + '">Run a Query.</a>',
            type: 'success',
            clear: true,
            escape: false
          });
        })
        .catch((error) => {
          FauxtonAPI.addNotification({
            msg: 'Failed to create index. ' + this.errorReason(error),
            type: 'error',
            clear: true
          });
        });
    };
  },

  errorReason: function (error) {
    return 'Reason: ' + ((error && error.message) || 'n/a');
  },

  runExplainQuery: function ({ databaseName, partitionKey, queryCode }) {
    return (dispatch) => {
      return MangoAPI.fetchQueryExplain(databaseName, partitionKey, queryCode)
        .then((explainPlan) => {
          dispatch(this.showQueryExplain({ explainPlan }));
        }).catch(() => {
          FauxtonAPI.addNotification({
            msg: 'There was an error fetching the query plan.',
            type: 'error',
            clear: true
          });
        });
    };
  }

};
