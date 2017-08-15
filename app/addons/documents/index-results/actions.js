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
import Stores from "./stores";
import SidebarActions from "../sidebar/actions";
var indexResultsStore = Stores.indexResultsStore;

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

export default {

  togglePrioritizedTableView: function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.INDEX_RESULTS_TOGGLE_PRIORITIZED_TABLE_VIEW
    });
  },

  sendMessageNewResultList: function (options) {
    FauxtonAPI.dispatch({
      type: ActionTypes.INDEX_RESULTS_NEW_RESULTS,
      options: options
    });
  },

  notifyOfWarnings: function (options) {
    var msg = options.collection.warning && options.collection.warning();
    if (msg) {
      FauxtonAPI.addNotification({
        msg: msg,
        clear:  false,
        type: 'error'
      });
    }
  },

  newResultsList: function (options) {
    this.clearResults();

    if (!options.collection.fetch) { return; }

    return options.collection.fetch({reset: true}).then(() => {
      this.sendMessageNewResultList(options);
      this.resultsListReset();
    }, (collection, _xhr) => {
      //Make this more robust as sometimes the colection is passed through here.
      var xhr = collection.responseText ? collection : _xhr;
      var errorMsg = 'Bad Request';
      console.log('xxx', xhr);

      try {
        const responseText = JSON.parse(xhr.responseText);
        if (responseText.reason) {
          errorMsg = responseText.reason;
        }

        if (responseText.reason && responseText.reason === 'missing_named_view') {
          errorMsg = `The ${options.collection.view} ${options.collection.design} does not exist.`;
          FauxtonAPI.navigate(
            FauxtonAPI.urls('allDocsSanitized', 'app', options.collection.database.safeID()),
            {trigger: true}
          );
          return;
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
    this.notifyOfWarnings(options);

    FauxtonAPI.dispatch({
      type: ActionTypes.INDEX_RESULTS_NEW_RESULTS,
      options: options
    });
  },

  runMangoFindQuery: function (options) {
    var query = JSON.parse(options.queryCode),
        collection = indexResultsStore.getCollection(),
        bulkCollection = indexResultsStore.getBulkDocCollection();

    this.clearResults();

    return collection
      .setQuery(query)
      .fetch()
      .then(function () {
        this.resultsListReset();
        this.newMangoResultsList({
          collection: collection,
          query: options.queryCode,
          textEmptyIndex: 'No Results Found!',
          bulkCollection: bulkCollection
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
    return this.newResultsList({
      collection: indexResultsStore.getCollection(),
      bulkCollection: indexResultsStore.getBulkDocCollection(),
      typeOfIndex: indexResultsStore.getTypeOfIndex()
    });
  },

  resultsListReset: function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.INDEX_RESULTS_RESET
    });
  },

  selectDoc: function (options) {
    FauxtonAPI.dispatch({
      type: ActionTypes.INDEX_RESULTS_SELECT_DOC,
      options: {
        _id: options._id,
        _rev: options._rev,
        _deleted: true
      }
    });
  },

  changeField: function (options) {
    FauxtonAPI.dispatch({
      type: ActionTypes.INDEX_RESULTS_SELECT_NEW_FIELD_IN_TABLE,
      options: options
    });
  },

  toggleAllDocuments: function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.INDEX_RESULTS_TOOGLE_SELECT_ALL_DOCUMENTS
    });
  },

  clearResults: function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.INDEX_RESULTS_CLEAR_RESULTS
    });
  },

  deleteSelected: function (bulkDeleteCollection, itemsLength, designDocs) {
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
    var selectedIds = [];
    const hasDesignDocs = !!bulkDeleteCollection.map(d => d.id).find((id) => /_design/.test(id));


    bulkDeleteCollection
      .bulkDelete()
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
        if (designDocs && hasDesignDocs) {
          SidebarActions.updateDesignDocs(designDocs);
        }
        reloadResultsList().then(function () {
          bulkDeleteCollection.reset(selectedIds);
        });
      });
  }
};
