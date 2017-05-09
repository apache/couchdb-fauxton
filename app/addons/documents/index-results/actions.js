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
import ActionTypes from "./actiontypes";
import Stores from "./stores";
import SidebarActions from "../sidebar/actions";
import {fetchAllDocs, bulkDeleteDocs} from "../api";
const indexResultsStore = Stores.indexResultsStore;

const errorMessage = (ids) => {
  let msg = 'Failed to delete your document!';

  if (ids) {
    msg = 'Failed to delete: ' + ids.join(', ');
  }

  FauxtonAPI.addNotification({
    msg: msg,
    type: 'error',
    clear:  true
  });
};

const storeDatabaseName = (databaseName) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.INDEX_RESULTS_STORE_DATABASE_NAME,
    options: {
      databaseName: databaseName
    }
  });
};

const getAllDocs = (databaseName, params) => {
  clearResults();

  return fetchAllDocs(databaseName, params).then((results) => {
    sendMessageNewResultList({
      results: results,
      params: params
    });
    resultsReady();
  });
};

const togglePrioritizedTableView = () => {
  FauxtonAPI.dispatch({
    type: ActionTypes.INDEX_RESULTS_TOGGLE_PRIORITIZED_TABLE_VIEW
  });
};

const sendMessageNewResultList = (options) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.INDEX_RESULTS_NEW_RESULTS,
    options: options
  });
};

const newMangoResultsList = (options) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.INDEX_RESULTS_NEW_RESULTS,
    options: options
  });
};

const runMangoFindQuery = (options) => {
  var query = JSON.parse(options.queryCode),
      collection = indexResultsStore.getCollection(),
      bulkCollection = indexResultsStore.getBulkDocCollection();

  clearResults();

  return collection
    .setQuery(query)
    .fetch()
    .then(function () {
      resultsReady();
      newMangoResultsList({
        collection: collection,
        query: options.queryCode,
        textEmptyIndex: 'No Results Found!',
        bulkCollection: bulkCollection
      });
    }.bind(this), function (res) {
      FauxtonAPI.addNotification({
        msg: res.reason,
        clear:  true,
        type: 'error'
      });

      this.resultsListReset();
    }.bind(this));
};

const resultsReady = () => {
  FauxtonAPI.dispatch({
    type: ActionTypes.INDEX_RESULTS_READY
  });
};

const selectDoc = (options) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.INDEX_RESULTS_SELECT_DOC,
    options: {
      _id: options._id,
      _rev: options._rev,
      _deleted: true
    }
  });
};

const changeField = (options) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.INDEX_RESULTS_SELECT_NEW_FIELD_IN_TABLE,
    options: options
  });
};

const toggleAllDocuments = () => {
  FauxtonAPI.dispatch({
    type: ActionTypes.INDEX_RESULTS_TOOGLE_SELECT_ALL_DOCUMENTS
  });
};

const clearResults = () => {
  FauxtonAPI.dispatch({
    type: ActionTypes.INDEX_RESULTS_CLEAR_RESULTS
  });
};

const deleteSelected = (databaseName, queryParams, selectedItems, designDocs) => {
  const itemsLength = selectedItems.length;

  var msg = (itemsLength === 1) ? 'Are you sure you want to delete this doc?' :
    'Are you sure you want to delete these ' + itemsLength + ' docs?';

  if (itemsLength === 0) {
    window.alert('Please select the document rows you want to delete.');
    return false;
  }

  if (!window.confirm(msg)) {
    return false;
  }

  // if the selected items contain any ddocs, we'll need to update the sidebar later on.
  const hasDesignDocs = !!selectedItems.map(d => d._id).find((_id) => /_design/.test(_id));

  return bulkDeleteDocs(databaseName, selectedItems).then((docs) => {
    FauxtonAPI.addNotification({
      msg: 'Successfully deleted your docs',
      clear:  true
    });

    const failedDocs = docs.filter(doc => !!doc.error).map(doc => doc.id);
    if (failedDocs.length > 0) {
      errorMessage(failedDocs);
    }

    if (designDocs && hasDesignDocs) {
      SidebarActions.updateDesignDocs(designDocs);
    }

    // reload the results after the delete
    return getAllDocs(databaseName, queryParams);
  });
};

export default {
  togglePrioritizedTableView,
  sendMessageNewResultList,
  newMangoResultsList,
  runMangoFindQuery,
  resultsReady,
  selectDoc,
  changeField,
  toggleAllDocuments,
  clearResults,
  deleteSelected,
  getAllDocs,
  storeDatabaseName
};
