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
  '../../../app',
  '../../../core/api',
  '../resources',
  './mango.actiontypes',
  './mango.stores',
  '../index-results/stores',
  '../index-results/actions',
],
function (app, FauxtonAPI, Documents, ActionTypes, Stores, IndexResultsStores, IndexResultActions) {
  var store = Stores.mangoStore;

  return {

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

    newQueryCreateIndexCode: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.MANGO_NEW_QUERY_CREATE_INDEX_CODE,
        options: options
      });
    },

    saveQuery: function (options) {
      var queryCode = JSON.parse(options.queryCode),
          mangoIndex = new Documents.MangoIndex(queryCode, {database: options.database});

      FauxtonAPI.addNotification({
        msg:  'Saving Index for Query...',
        type: 'info',
        clear: true
      });

      mangoIndex
        .save()
        .then(function (res) {
          var url = '#' + FauxtonAPI.urls('mango', 'query-app', options.database.safeID());

          FauxtonAPI.dispatch({
            type: ActionTypes.MANGO_NEW_QUERY_FIND_CODE_FROM_FIELDS,
            options: {
              fields: queryCode.index.fields
            }
          });

          var mangoIndexCollection = new Documents.MangoIndexCollection(null, {
            database: options.database,
            params: null,
            paging: {
              pageSize: IndexResultsStores.indexResultsStore.getPerPage()
            }
          });

          this.getIndexList({indexList: mangoIndexCollection}).then(function () {

            IndexResultActions.reloadResultsList();

            FauxtonAPI.addNotification({
              msg: 'Index is ready for querying. <a href="' + url + '">Run a Query.</a>',
              type: 'success',
              clear: true,
              escape: false
            });
          }.bind(this));

        }.bind(this))
        .fail(function (res) {
          FauxtonAPI.addNotification({
            msg: res.responseJSON.reason,
            type: 'error',
            clear: true
          });
        });
    },

    mangoResetIndexList: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.MANGO_RESET,
        options: options
      });
    },

    getIndexList: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.MANGO_NEW_AVAILABLE_INDEXES,
        options: options
      });

      return options.indexList.fetch({reset: true}).then(function () {
        this.mangoResetIndexList({isLoading: false});
      }.bind(this), function () {
        FauxtonAPI.addNotification({
          msg: 'Bad request!',
          type: "error",
          clear:  true
       });
      });
    }
  };
});
