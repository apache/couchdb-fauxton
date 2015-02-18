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
  'addons/documents/pagination/stores'
],
function (app, FauxtonAPI, ActionTypes, Stores) {

  var store = Stores.indexPaginationStore;

  return {
    updatePerPage: function (perPage) {
      FauxtonAPI.dispatch({
        type: ActionTypes.PER_PAGE_CHANGE,
        perPage: perPage
      });

      FauxtonAPI.triggerRouteEvent('perPageChange', store.documentsLeftToFetch());
    },

    newPagination: function (collection) {
      FauxtonAPI.dispatch({
        type: ActionTypes.NEW_PAGINATION,
        collection: collection
      });
    },

    setDocumentLimit: function (docLimit) {
      FauxtonAPI.dispatch({
        type: ActionTypes.SET_PAGINATION_DOCUMENT_LIMIT,
        docLimit: docLimit
      });
    },

    collectionReset: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.PAGINATION_COLLECTION_RESET,
      });
    },

    paginateNext: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.PAGINATE_NEXT,
      });

      FauxtonAPI.triggerRouteEvent('paginate', {
       direction: 'next',
       perPage: store.documentsLeftToFetch(),
       currentPage: store.getCurrentPage()
      });
    },

    paginatePrevious: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.PAGINATE_PREVIOUS,
      });

      FauxtonAPI.triggerRouteEvent('paginate', {
       direction: 'previous',
       perPage: store.getPerPage(),
       currentPage: store.getCurrentPage()
      });
    },

  };
});
