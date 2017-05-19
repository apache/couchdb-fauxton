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
import 'whatwg-fetch';
import FauxtonAPI from '../../../../core/api';
import queryString from 'query-string';
import SidebarActions from '../../sidebar/actions';
import { nowLoading, newResultsAvailable, newSelectedDocs } from './base-api';

const maxDocLimit = 10000;

// This is a helper function to determine what params need to be sent to couch based
// on what the user entered (i.e. queryOptionsParams) and what fauxton is using to
// emulate pagination (i.e. fetchParams).
const mergeParams = (fetchParams, queryOptionsParams) => {
  const params = {};

  // determine the final "index" or "position" in the total result list based on the
  // user's skip and limit inputs.  If queryOptionsParams.limit is empty,
  // finalDocPosition will be NaN.  That's ok.
  const finalDocPosition = (queryOptionsParams.skip || 0) + queryOptionsParams.limit;

  // The skip value sent to couch will be the max of our current pagination skip
  // (i.e. fetchParams.skip) and the user's original skip input (i.e. queryOptionsParams.skip).
  // The limit will continue to be our pagination limit.
  params.skip = Math.max(fetchParams.skip, queryOptionsParams.skip || 0);
  params.limit = fetchParams.limit;

  // Determine the total number of documents remaining based on the user's skip and
  // limit inputs.  Again, note that this will be NaN if queryOptionsParams.limit is
  // empty.  That's ok.
  const totalDocsRemaining = finalDocPosition - params.skip;

  // return the merged params to send to couch and the num docs remaining.
  return {
    params: Object.assign({}, queryOptionsParams, params),
    totalDocsRemaining: totalDocsRemaining
  };
};

// All the business logic for fetching docs from couch.
// Arguments:
// - databaseName -> the name of the database to fetch from
// - fetchParams -> the internal params fauxton uses to emulate pagination
// - queryOptionsParams -> manual query params entered by user
export const fetchAllDocs = (databaseName, fetchParams, queryOptionsParams) => {
  const { params, totalDocsRemaining } = mergeParams(fetchParams, queryOptionsParams);
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
      const docs = res.error ? [] : res.rows;

      // Now is the time to determine if we have another page of results
      // after this set of documents.  We also want to manipulate the array
      // of docs because we always search with a limit larger than the desired
      // number of results.  This is necessaary to emulate pagination.
      let canShowNext = false;
      if (totalDocsRemaining && docs.length > totalDocsRemaining) {
        // We know the user manually entered a limit and we've reached the
        // end of their desired results.  We need to remove any extra results
        // that were returned because of our pagination emulation logic.
        docs.splice(totalDocsRemaining);
      } else if (docs.length === params.limit) {
        // The number of docs returned is equal to our params.limit, which is
        // one more than our perPage size.  We know that there is another
        // page of results after this.
        docs.splice(params.limit - 1);
        canShowNext = true;
      }

      // dispatch that we're all done
      dispatch(newResultsAvailable(docs, params, canShowNext));
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
