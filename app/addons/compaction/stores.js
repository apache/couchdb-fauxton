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
  'api',
  'addons/compaction/actiontypes'
],

function (FauxtonAPI, ActionTypes) {
  var Stores = {};

  Stores.CompactionStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._isCleanupViewsModalVisible = false;
      this._currentDatabase = '';
      this._isCleaningViews = false;
    },

    isCleaningViews: function () {
      return this._isCleaningViews;
    },

    isCleanupViewsModalVisible: function () {
      return this._isCleanupViewsModalVisible;
    },

    openCleanupViewsModal: function (dbName) {
      this._isCleanupViewsModalVisible = true;
      this._currentDatabase = dbName;
    },

    closeCleanupViewsModal: function () {
      this._isCleanupViewsModalVisible = false;
      this._currentDatabase = '';
    },

    getCurrentDatabase: function () {
      return this._currentDatabase;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.COMPACTION_CLEANUP_STARTED:
          this._isCleaningViews = true;
        break;

        case ActionTypes.COMPACTION_CLEANUP_FINISHED:
          this._isCleaningViews = false;
        break;

        case ActionTypes.COMPACTION_OPEN_CLEANUP_VIEWS_MODAL:
          this.openCleanupViewsModal(action.options.databaseName);
        break;

        case ActionTypes.COMPACTION_CLOSE_CLEANUP_VIEWS_MODAL:
          this.closeCleanupViewsModal();
        break;

        default:
        return;
        // do nothing
      }

      this.triggerChange();
    }
  });

  Stores.compactionStore = new Stores.CompactionStore();
  Stores.compactionStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.compactionStore.dispatch);

  return Stores;
});
