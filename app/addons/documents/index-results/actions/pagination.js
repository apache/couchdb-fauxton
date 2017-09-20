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

import FauxtonAPI from '../../../../core/api';
import { fetchDocs } from './fetch';
import ActionTypes from '../actiontypes';

export const toggleShowAllColumns = () => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_TOGGLE_SHOW_ALL_COLUMNS
  };
};

export const setPerPage = (amount) => {
  return {
    type: ActionTypes.INDEX_RESULTS_REDUX_SET_PER_PAGE,
    perPage: amount
  };
};

export const resetFetchParamsBeforePerPageChange = (fetchParams, queryOptionsParams, amount) => {
  return Object.assign({}, fetchParams, {
    limit: amount + 1,
    skip: queryOptionsParams.skip || 0
  });
};

export const updatePerPageResults = (queryDocs, fetchParams, queryOptionsParams, amount) => {
  // Set the query limit to the perPage + 1 so we know if there is
  // a next page.  We also need to reset to the beginning of all
  // possible pages since our logic to paginate backwards can't handle
  // changing perPage amounts.
  fetchParams = resetFetchParamsBeforePerPageChange(fetchParams, queryOptionsParams, amount);

  return (dispatch) => {
    dispatch(setPerPage(amount));
    dispatch(fetchDocs(queryDocs, fetchParams, queryOptionsParams));
  };
};

export const incrementSkipForPageNext = (fetchParams, perPage) => {
  return Object.assign({}, fetchParams, {
    skip: fetchParams.skip + perPage
  });
};

export const paginateNext = (queryDocs, fetchParams, queryOptionsParams, perPage) => {
  // add the perPage to the previous skip.
  fetchParams = incrementSkipForPageNext(fetchParams, perPage);

  return (dispatch) => {
    dispatch({
      type: ActionTypes.INDEX_RESULTS_REDUX_PAGINATE_NEXT
    });
    dispatch(fetchDocs(queryDocs, fetchParams, queryOptionsParams));
  };
};

export const decrementSkipForPagePrevious = (fetchParams, perPage) => {
  return Object.assign({}, fetchParams, {
    skip: Math.max(fetchParams.skip - perPage, 0)
  });
};

export const paginatePrevious = (queryDocs, fetchParams, queryOptionsParams, perPage) => {
  // subtract the perPage to the previous skip.
  fetchParams = decrementSkipForPagePrevious(fetchParams, perPage);

  return (dispatch) => {
    dispatch({
      type: ActionTypes.INDEX_RESULTS_REDUX_PAGINATE_PREVIOUS
    });
    dispatch(fetchDocs(queryDocs, fetchParams, queryOptionsParams));
  };
};

export const resetPagination = (perPage = FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE) => {
  return setPerPage(perPage);
};
