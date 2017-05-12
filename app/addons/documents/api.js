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

const nowLoading = () => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_IS_LOADING
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

export const bulkDeleteDocs = (databaseName, docs, designDocs) => {
  if (!validateBulkDelete(docs)) {
    return false;
  }

  return bulkDeleteDocsPost(databaseName, docs).then((res) => {
    FauxtonAPI.addNotification({
      msg: 'Successfully deleted your docs',
      clear:  true
    });

    const failedDocs = res.filter(doc => !!doc.error).map(doc => doc.id);
    const hasDesignDocs = !!docs.map(d => d._id).find((_id) => /_design/.test(_id));

    if (failedDocs.length > 0) {
      errorMessage(failedDocs);
    }

    if (designDocs && hasDesignDocs) {
      SidebarActions.updateDesignDocs(designDocs);
    }
  });
};

const bulkDeleteDocsPost = (databaseName, docs) => {
  return fetch(`/${databaseName}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(docs),
    headers: {
      'Accept': 'application/json; charset=utf-8',
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json());
};

export const initialize = (params) => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_INITIALIZE,
    params: params
  };
};

export const selectDoc = (doc) => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_SELECT_DOC,
    doc: doc
  };
};
