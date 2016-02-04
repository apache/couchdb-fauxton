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
  "../../../core/api",
  './actiontypes',
  '../index-results/actions',


],
function (app, FauxtonAPI, ActionTypes, IndexResultsActions) {

  return {

    updatePerPage: function (perPage, collection, bulkCollection) {

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
    },

    setDocumentLimit: function (docLimit) {
      FauxtonAPI.dispatch({
        type: ActionTypes.SET_PAGINATION_DOCUMENT_LIMIT,
        docLimit: docLimit
      });
    },

    paginateNext: function (collection, bulkCollection) {
      FauxtonAPI.dispatch({
        type: ActionTypes.PAGINATE_NEXT,
      });

      IndexResultsActions.clearResults();
      collection.next().then(function () {
        IndexResultsActions.resultsListReset();

        IndexResultsActions.sendMessageNewResultList({
          collection: collection,
          bulkCollection: bulkCollection
        });
      });
    },

    paginatePrevious: function (collection, bulkCollection) {
      FauxtonAPI.dispatch({
        type: ActionTypes.PAGINATE_PREVIOUS,
      });

      IndexResultsActions.clearResults();
      collection.previous().then(function () {
        IndexResultsActions.resultsListReset();

        IndexResultsActions.sendMessageNewResultList({
          collection: collection,
          bulkCollection: bulkCollection
        });
      });
    },

    toggleTableViewType: function () {
      IndexResultsActions.togglePrioritizedTableView();
    }

  };
});
