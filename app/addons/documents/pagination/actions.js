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
import IndexResultsActions from "../index-results/actions";

const updatePerPage = (perPage, collection, bulkCollection) => {

  FauxtonAPI.dispatch({
    type: ActionTypes.PER_PAGE_CHANGE,
    perPage: perPage
  });

  IndexResultsActions.clearResults();
  collection.fetch().then(function () {
    IndexResultsActions.resultsListReset();
    IndexResultsActions.sendMessageNewResultList({
      collection: collection,
      bulkCollection: bulkCollection
    });
  });
};

const setDocumentLimit = (docLimit) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.SET_PAGINATION_DOCUMENT_LIMIT,
    docLimit: docLimit
  });
};

const paginateNext = (collection, bulkCollection) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.PAGINATE_NEXT,
  });

  IndexResultsActions.clearResults();
  collection.next().then(function () {
    // update the cached offset for improved UX between layouts
    setCachedOffset(collection.paging.params.skip);

    IndexResultsActions.resultsListReset();

    IndexResultsActions.sendMessageNewResultList({
      collection: collection,
      bulkCollection: bulkCollection
    });
  });
};

const paginatePrevious = (collection, bulkCollection) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.PAGINATE_PREVIOUS,
  });

  IndexResultsActions.clearResults();
  collection.previous().then(function () {
    // update the cached offset for improved UX between layouts
    setCachedOffset(collection.paging.params.skip);

    IndexResultsActions.resultsListReset();

    IndexResultsActions.sendMessageNewResultList({
      collection: collection,
      bulkCollection: bulkCollection
    });
  });
};

const toggleTableViewType = () => {
  IndexResultsActions.togglePrioritizedTableView();
};

const deleteCachedOffset = () => {
  FauxtonAPI.dispatch({
    type: ActionTypes.DELETE_CACHED_OFFSET
  });
};

const setCachedOffset = (offset) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.SET_CACHED_OFFSET,
    options: {
      offset: offset
    }
  });
};

const setPageStart = (start) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.SET_PAGE_START,
    options: {
      start: start
    }
  });
};

const resetPagination = () => {
  FauxtonAPI.dispatch({
    type: ActionTypes.RESET_PAGINATION
  });
};

export default {
  updatePerPage,
  setDocumentLimit,
  paginateNext,
  paginatePrevious,
  toggleTableViewType,
  deleteCachedOffset,
  setCachedOffset,
  setPageStart,
  resetPagination
};
