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
  'addons/documents/index-results/actiontypes',
  'addons/documents/index-results/stores',
  'addons/documents/header/header.stores',
  'addons/documents/header/header.actions',
  'addons/documents/resources'
],
function (app, FauxtonAPI, ActionTypes, Stores, HeaderStores, HeaderActions, Documents) {
  var indexResultsStore = Stores.indexResultsStore;
  var headerBarStore = HeaderStores.headerBarStore;

  var errorMessage = function (ids) {
    var msg = 'Failed to delete your document!';

    if (ids) {
      msg = 'Failed to delete: ' + ids.join(', ');
    }

    FauxtonAPI.addNotification({
      msg: msg,
      type: 'error',
      clear:  true
    });
  };

  return {
    newResultsList: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.INDEX_RESULTS_NEW_RESULTS,
        options: options
      });

      if (!options.collection.fetch) { return; }
      this.clearResults();

      return options.collection.fetch({reset: true}).then(function () {
        this.resultsListReset();
      }.bind(this), function (collection, _xhr) {
        //Make this more robust as sometimes the colection is passed through here.
        var xhr = collection.responseText ? collection : _xhr;
        var errorMsg = 'Bad Request';

        try {
          var responseText = JSON.parse(xhr.responseText);
          if (responseText.reason) {
            errorMsg = responseText.reason;
          }
        } catch (e) {
          console.log(e);
        }

        FauxtonAPI.addNotification({
          msg: errorMsg,
          type: "error",
          clear:  true
       });
      });
    },

    newMangoResultsList: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.INDEX_RESULTS_NEW_RESULTS,
        options: options
      });
    },

    runMangoFindQuery: function (options) {
      var query = JSON.parse(options.queryCode),
          collection = indexResultsStore.getCollection();

      this.clearResults();

      return collection
        .setQuery(query)
        .fetch()
        .then(function () {
          this.resultsListReset();
          this.newMangoResultsList({
            collection: collection,
            isListDeletable: indexResultsStore.isListDeletable(),
            query: options.queryCode,
            textEmptyIndex: 'No Results Found!',
            bulkCollection: Documents.BulkDeleteDocCollection
          });
        }.bind(this), function (res) {
          FauxtonAPI.addNotification({
            msg: res.reason,
            clear:  true,
            type: 'error'
          });

          this.resultsListReset();
        }.bind(this));
    },

    reloadResultsList: function () {
      if (indexResultsStore.getTypeOfIndex() === 'mango') {
        return this.newResultsList({
          collection: indexResultsStore.getCollection(),
          isListDeletable: true,
          bulkCollection: Documents.MangoBulkDeleteDocCollection,
          typeOfIndex: 'mango'
        });
      }

      return this.newResultsList({
        collection: indexResultsStore.getCollection(),
        isListDeletable: indexResultsStore.isListDeletable(),
        bulkCollection: Documents.BulkDeleteDocCollection
      });
    },

    resultsListReset: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.INDEX_RESULTS_RESET
      });
    },

    selectDoc: function (id) {
      FauxtonAPI.dispatch({
        type: ActionTypes.INDEX_RESULTS_SELECT_DOC,
        id: id
      });

      //show menu
      if (!headerBarStore.getToggleStatus()) {
        HeaderActions.toggleHeaderControls();
        return;
      }

      //hide menu
      if (headerBarStore.getToggleStatus() && indexResultsStore.getSelectedItemsLength() === 0) {
        HeaderActions.toggleHeaderControls();
      }
    },

    selectListOfDocs: function (ids) {
      FauxtonAPI.dispatch({
        type: ActionTypes.INDEX_RESULTS_SELECT_LIST_OF_DOCS,
        ids: ids
      });
    },

    clearResults: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.INDEX_RESULTS_CLEAR_RESULTS
      });
    },

    deleteSelected: function () {
      var itemsLength = indexResultsStore.getSelectedItemsLength();
      var msg = (itemsLength === 1) ? 'Are you sure you want to delete this doc?' :
        'Are you sure you want to delete these ' + itemsLength + ' docs?';

      if (itemsLength === 0) {
        window.alert('Please select the document rows you want to delete.');
        return false;
      }

      if (!window.confirm(msg)) {
        return false;
      }

      var reloadResultsList = _.bind(this.reloadResultsList, this);
      var selectListOfDocs = _.bind(this.selectListOfDocs, this);
      var selectedIds = [];

      indexResultsStore.createBulkDeleteFromSelected().bulkDelete()
      .then(function (ids) {
        FauxtonAPI.addNotification({
          msg: 'Successfully deleted your docs',
          clear:  true
        });

        if (!_.isEmpty(ids.errorIds)) {
          errorMessage(ids.errorIds);
          selectedIds = ids.errorIds;
        }
      }, function (ids) {
        errorMessage(ids);
        selectedIds = ids;
      })
      .always(function () {
        reloadResultsList().then(function () {
          selectListOfDocs(selectedIds);
        });
      });
    }
  };
});
