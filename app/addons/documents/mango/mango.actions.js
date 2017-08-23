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
import Documents from "../resources";
import ActionTypes from "./mango.actiontypes";
import IndexResultActions from "../index-results/actions";

export default {

  setDatabase: function (options) {
    FauxtonAPI.dispatch({
      type: ActionTypes.MANGO_SET_DB,
      options: options
    });
  },

  newQueryFindCode: function (options) {
    FauxtonAPI.dispatch({
      type: ActionTypes.MANGO_NEW_QUERY_FIND_CODE,
      options: options
    });
  },

  newQueryCreateIndexTemplate: function (options) {
    FauxtonAPI.dispatch({
      type: ActionTypes.MANGO_NEW_QUERY_CREATE_INDEX_TEMPLATE,
      options: options
    });
  },

  saveIndex: function ({database, queryCode}) {
    const query = JSON.parse(queryCode),
        mangoIndex = new Documents.MangoIndex(query, {database: database});

    FauxtonAPI.addNotification({
      msg:  'Saving Index for Query...',
      type: 'info',
      clear: true
    });

    mangoIndex
      .save()
      .then(function () {
        var url = '#' + FauxtonAPI.urls('mango', 'query-app', database.safeID());

        // force mango index list to reload
        IndexResultActions.reloadResultsList();

        FauxtonAPI.addNotification({
          msg: 'Index is ready for querying. <a href="' + url + '">Run a Query.</a>',
          type: 'success',
          clear: true,
          escape: false
        });
      })
      .fail(function (res) {
        FauxtonAPI.addNotification({
          msg: res.responseJSON.reason,
          type: 'error',
          clear: true
        });
      });
  },

  runExplainQuery: function ({database, queryCode}) {
    const url = FauxtonAPI.urls('mango', 'explain-server', database.safeID()),
        query = JSON.parse(queryCode);

    $.ajax({
      type: 'POST',
      url: url,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify(query)
    }).then(function (explainPlan) {
      FauxtonAPI.dispatch({
        type: ActionTypes.MANGO_EXPLAIN_RESULTS,
        options: {
          explainPlan: explainPlan
        }
      });
    }).fail(function () {
      FauxtonAPI.addNotification({
        msg: 'There was an error fetching the query plan.',
        type: 'error',
        clear: true
      });
    });
  }
};
