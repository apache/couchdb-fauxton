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
  'addons/documents/docs-list/actiontypes',
  'addons/documents/docs-list/stores'
],
function (app, FauxtonAPI, ActionTypes, Stores) {

  return {
    collectionChanged: function (collection, pagination, perPage) {
      FauxtonAPI.dispatch({
        type: ActionTypes.COLLECTION_CHANGED,
        collection: collection,
        pagination: pagination,
        perPage: perPage
      });
    },

    updatePerPage: function (perPage) {
      var pagination = Stores.allDocsListStore.getPagination();
      pagination.updatePerPage(perPage);

      FauxtonAPI.dispatch({
        type: ActionTypes.PER_PAGE_CHANGE,
        perPage: pagination.documentsLeftToFetch()
      });

      FauxtonAPI.triggerRouteEvent('perPageChange', pagination.documentsLeftToFetch());
    }

  };
});
