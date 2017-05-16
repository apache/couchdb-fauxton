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

import 'url-polyfill';
//import app from '../../app';
import FauxtonAPI from '../../core/api';
//import base64 from 'base-64';
//import _ from 'lodash';
import 'whatwg-fetch';
import queryString from 'query-string';
import ActionTypes from './index-results/actiontypes';
import SidebarActions from './sidebar/actions';

const maxDocLimit = 10000;

const nowLoading = () => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_IS_LOADING
  };
};

export const resetState = () => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_RESET_STATE
  };
};

const newResultsAvailable = (docs, databaseName, params) => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_NEW_RESULTS,
    docs: docs,
    databaseName: databaseName,
    params: params
  };
};

export const fetchAllDocs = (databaseName, params) => {
  params.limit = Math.min(params.limit, maxDocLimit);

  return (dispatch) => {
    // first, tell app state that we're loading
    dispatch(nowLoading());

    // now fetch the results
    const query = queryString.stringify(params);
    return fetch(`/${databaseName}/_all_docs?${query}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json; charset=utf-8'
      }
    })
    .then(res => res.json())
    .then((res) => {

      // dispatch that we're all done
      dispatch(newResultsAvailable(res.error ? [] : res.rows, databaseName, params));
    });
  };
};

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

const validateBulkDelete = (docs) => {
  const itemsLength = docs.length;

  const msg = (itemsLength === 1) ? 'Are you sure you want to delete this doc?' :
    'Are you sure you want to delete these ' + itemsLength + ' docs?';

  if (itemsLength === 0) {
    window.alert('Please select the document rows you want to delete.');
    return false;
  }

  if (!window.confirm(msg)) {
    return false;
  }

  return true;
};

export const bulkDeleteDocs = (databaseName, docs, designDocs, params) => {
  if (!validateBulkDelete(docs)) {
    return false;
  }

  return (dispatch) => {
    const payload = {
      docs: docs
    };

    return fetch(`/${databaseName}/_bulk_docs`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(payload),
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then((res) => {
      if (res.error) {
        errorMessage();
        return;
      }
      processBulkDeleteResponse(res, docs, designDocs);
      dispatch(newSelectedDocs());
      dispatch(fetchAllDocs(databaseName, params));
    });
  };
};

const processBulkDeleteResponse = (res, originalDocs, designDocs) => {
  FauxtonAPI.addNotification({
    msg: 'Successfully deleted your docs',
    clear:  true
  });

  const failedDocs = res.filter(doc => !!doc.error).map(doc => doc.id);
  const hasDesignDocs = !!originalDocs.map(d => d._id).find((_id) => /_design/.test(_id));

  if (failedDocs.length > 0) {
    errorMessage(failedDocs);
  }

  if (designDocs && hasDesignDocs) {
    SidebarActions.updateDesignDocs(designDocs);
  }
};

export const initialize = (params) => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_INITIALIZE,
    params: params
  };
};

const newSelectedDocs = (selectedDocs = []) => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_NEW_SELECTED_DOCS,
    selectedDocs: selectedDocs
  };
};

export const selectDoc = (doc, selectedDocs) => {
  const indexInSelectedDocs = selectedDocs.findIndex((selectedDoc) => {
    return selectedDoc._id === doc._id;
  });

  if (indexInSelectedDocs > -1) {
    selectedDocs.splice(indexInSelectedDocs, 1);
  } else {
    selectedDocs.push(doc);
  }

  return newSelectedDocs(selectedDocs);
};

export const bulkCheckOrUncheck = (docs, selectedDocs, allDocumentsSelected) => {
  docs.forEach((doc) => {
    // find the index of the doc in the selectedDocs array
    const indexInSelectedDocs = selectedDocs.findIndex((selectedDoc) => {
      return doc._id || doc.id === selectedDoc._id;
    });

    // remove the doc if we know all the documents are currently selected
    if (allDocumentsSelected) {
      selectedDocs.splice(indexInSelectedDocs, 1);
    // otherwise, add the doc if it doesn't exist in the selectedDocs array
    } else if (indexInSelectedDocs === -1) {
      selectedDocs.push({
        _id: doc._id || doc.id,
        _rev: doc._rev || doc.rev,
        _deleted: true
      });
    }
  });

  return newSelectedDocs(selectedDocs);
};

export const changeLayout = (newLayout) => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_CHANGE_LAYOUT,
    layout: newLayout
  };
};

export const toggleShowAllColumns = () => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_TOGGLE_SHOW_ALL_COLUMNS
  };
};

const setPerPage = (amount) => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_SET_PER_PAGE,
    perPage: amount
  };
};

export const updatePerPageResults = (databaseName, amount, params) => {
  // Set the query limit to the perPage + 1 so we know if there is
  // a next page.  We also need to reset to the beginning of all
  // possible pages since our logic to paginate backwards can't handle
  // changing perPage amounts.
  params.limit = amount + 1;
  params.skip = 0;

  return (dispatch) => {
    dispatch(setPerPage(amount));
    dispatch(fetchAllDocs(databaseName, params));
  };
};

export const paginateNext = (databaseName, params, perPage) => {
  // add the perPage to the previous skip.
  if (!params.skip) {
    params.skip = 0;
  }
  params.skip += perPage;

  return (dispatch) => {
    dispatch({
      type: ActionTypes.INDEX_RESULTS_REDUX_PAGINATE_NEXT
    });
    dispatch(fetchAllDocs(databaseName, params));
  };
};

export const paginatePrevious = (databaseName, params, perPage) => {
  // subtract the perPage to the previous skip.
  params.skip = Math.max(params.skip - perPage, 0);

  return (dispatch) => {
    dispatch({
      type: ActionTypes.INDEX_RESULTS_REDUX_PAGINATE_PREVIOUS
    });
    dispatch(fetchAllDocs(databaseName, params));
  };
};

export const changeTableHeaderAttribute = (newField, selectedFields) => {
  selectedFields[newField.index] = newField.newSelectedRow;
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_CHANGE_TABLE_HEADER_ATTRIBUTE,
    selectedFieldsTableView: selectedFields
  };
};
