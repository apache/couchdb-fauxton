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
  'app',
  'api',
  'addons/documents/pagination/actiontypes',
  'addons/documents/pagination/stores',
  'addons/documents/index-results/actions'
],
function (app, FauxtonAPI, ActionTypes, Stores, IndexResultsActions) {

  var store = Stores.indexPaginationStore;

  return {
    updatePerPage: function (perPage) {
      FauxtonAPI.dispatch({
        type: ActionTypes.PER_PAGE_CHANGE,
        perPage: perPage
      });

      IndexResultsActions.clearResults();

      store.getCollection().fetch().then(function () {
        IndexResultsActions.resultsListReset();
      });
    },

    setDocumentLimit: function (docLimit) {
      FauxtonAPI.dispatch({
        type: ActionTypes.SET_PAGINATION_DOCUMENT_LIMIT,
        docLimit: docLimit
      });
    },

    paginateNext: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.PAGINATE_NEXT,
      });

      IndexResultsActions.clearResults();

      store.getCollection().next().then(function () {
        IndexResultsActions.resultsListReset();
      });
    },

    paginatePrevious: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.PAGINATE_PREVIOUS,
      });

      IndexResultsActions.clearResults();

      store.getCollection().previous().then(function () {
        IndexResultsActions.resultsListReset();
      });
    },

  };
});
