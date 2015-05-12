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
      this._isCompacting = false;
      this._isCleaningView = false;
      this._isCompactingView = false;
    },

    isCompacting: function () {
      return this._isCompacting;
    },

    isCleaningViews: function () {
      return this._isCleaningViews;
    },

    isCompactingView: function () {
      return this._isCompactingView;
    },

    setDatabase: function (database) {
      this._database = database;
    },

    getDatabase: function () {
      return this._database;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.COMPACTION_SET_UP:
          this.setDatabase(action.database);
          this.triggerChange();
        break;
        case ActionTypes.COMPACTION_COMPACTION_STARTING:
          this._isCompacting = true;
          this.triggerChange();
        break;
        case ActionTypes.COMPACTION_COMPACTION_FINISHED:
          this._isCompacting = false;
          this.triggerChange();
        break;
        case ActionTypes.COMPACTION_CLEANUP_STARTED:
          this._isCleaningViews = true;
          this.triggerChange();
        break;
        case ActionTypes.COMPACTION_CLEANUP_FINISHED:
          this._isCleaningViews = false;
          this.triggerChange();
        break;
        case ActionTypes.COMPACTION_VIEW_STARTED:
          this._isCompactingView = true;
          this.triggerChange();
        break;
        case ActionTypes.COMPACTION_VIEW_FINISHED:
          this._isCompactingView = false;
          this.triggerChange();
        break;

        default:
        return;
        // do nothing
      }
    }

  });

  Stores.compactionStore = new Stores.CompactionStore();

  Stores.compactionStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.compactionStore.dispatch);

  return Stores;
});
