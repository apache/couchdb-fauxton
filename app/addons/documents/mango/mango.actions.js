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
import IndexResultsStores from "../index-results/stores";
import IndexResultActions from "../index-results/actions";
import * as MangoAPI from "./mango.api";

export default {

  setDatabase: function (options) {
    return {
      type: ActionTypes.MANGO_SET_DB,
      options: options
    };
  },

  newQueryFindCode: function (options) {
    return {
      type: ActionTypes.MANGO_NEW_QUERY_FIND_CODE,
      options: options
    };
  },

  mangoResetIndexList: function (options) {
    return {
      type: ActionTypes.MANGO_RESET,
      options: options
    };
  },

  newQueryCreateIndexCode: function (options) {
    return {
      type: ActionTypes.MANGO_NEW_QUERY_CREATE_INDEX_CODE,
      options: options
    };
  },

  newQueryFindCodeFromFields: function (options) {
    return {
      type: ActionTypes.MANGO_NEW_QUERY_FIND_CODE_FROM_FIELDS,
      options: options
    };
  },

  newAvailableIndexes: function (options) {
    return {
      type: ActionTypes.MANGO_NEW_AVAILABLE_INDEXES,
      options: options
    };
  },

  // TODO
  saveQuery: function (options) {
    var queryCode = JSON.parse(options.queryCode),
      mangoIndex = new Documents.MangoIndex(queryCode, { database: options.database });

    FauxtonAPI.addNotification({
      msg: 'Saving Index for Query...',
      type: 'info',
      clear: true
    });

    mangoIndex
      .save()
      .then(() => {
        var url = '#' + FauxtonAPI.urls('mango', 'query-app', options.database.safeID());

        this.newQueryFindCodeFromFields({
          fields: queryCode.index.fields
        });

        var mangoIndexCollection = new Documents.MangoIndexCollection(null, {
          database: options.database,
          params: null,
          paging: {
            pageSize: IndexResultsStores.indexResultsStore.getPerPage()
          }
        });

        this.getIndexList({ indexList: mangoIndexCollection }).then(() => {

          IndexResultActions.reloadResultsList();

          FauxtonAPI.addNotification({
            msg: 'Index is ready for querying. <a href="' + url + '">Run a Query.</a>',
            type: 'success',
            clear: true,
            escape: false
          });
        });
      })
      .fail((res) => {
        FauxtonAPI.addNotification({
          msg: res.responseJSON.reason,
          type: 'error',
          clear: true
        });
      });
  },

  getIndexList: function ({ databaseName }) {
    return (dispatch) => {
      MangoAPI.fetchIndexList(databaseName).then((res) => {
        console.log('fetchIndexList response is ', res);
        dispatch(this.newAvailableIndexes({ indexList: res.indexes }));
        dispatch(this.mangoResetIndexList({ isLoading: false }));
      }).catch((error) => {
        console.log('fetchIndexList:', error);
        let errorMsg = 'Faild to retrieve index list.';
        if (error.message && error.message.indexOf('(not_found)') != -1) {
          //const databaseName = options.indexList.database.safeID();
          const databaseName = databaseName;
          errorMsg = `The ${databaseName} database does not exist.`;
          FauxtonAPI.navigate('/', {trigger: true});
        }
        FauxtonAPI.addNotification({
          msg: errorMsg,
          type: 'error',
          clear: true
        });
      });
    };
  }
  // getIndexList: function (options) {
  //   this.newAvailableIndexes(options);

  //   return options.indexList.fetch({reset: true}).then(() => {
  //     this.mangoResetIndexList({isLoading: false});
  //   }, (xhr) => {
  //     let errorMsg = 'Bad request!';
  //     if (xhr.responseJSON && xhr.responseJSON.error === 'not_found') {
  //       const databaseName = options.indexList.database.safeID();
  //       errorMsg = `The ${databaseName} database does not exist.`;
  //       FauxtonAPI.navigate('/', {trigger: true});
  //     }
  //     FauxtonAPI.addNotification({
  //       msg: errorMsg,
  //       type: "error",
  //       clear:  true
  //    });
  //   });
  // }
};
