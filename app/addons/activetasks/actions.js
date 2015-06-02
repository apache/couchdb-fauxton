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
  'addons/activetasks/actiontypes',
  'addons/activetasks/resources'
],
function (FauxtonAPI, ActionTypes, Resources) {
  return {
    init: function (activeTasks) {
      this.fetchAndSetActiveTasks(activeTasks.table, activeTasks);
      FauxtonAPI.when(activeTasks.fetch()).then(function () {
        this.fetchAndSetActiveTasks(activeTasks.table, activeTasks);
        this.setActiveTaskIsLoading(false);
      }.bind(this));
    },

    fetchAndSetActiveTasks: function (collection, backboneCollection) {
      FauxtonAPI.dispatch({
        type: ActionTypes.ACTIVE_TASKS_FETCH_AND_SET,
        options: {
          collectionTable: collection,
          backboneCollection: backboneCollection
        }
      });
    },
    changePollingInterval: function (interval) {
      FauxtonAPI.dispatch({
        type: ActionTypes.ACTIVE_TASKS_CHANGE_POLLING_INTERVAL,
        options: interval
      });
    },
    switchTab: function (tab) {
      FauxtonAPI.dispatch({
        type: ActionTypes.ACTIVE_TASKS_SWITCH_TAB,
        options: tab
      });
    },
    setCollection: function (collection) {
      FauxtonAPI.dispatch({
        type: ActionTypes.ACTIVE_TASKS_SET_COLLECTION,
        options: collection
      });
    },
    setSearchTerm: function (searchTerm) {
      FauxtonAPI.dispatch({
        type: ActionTypes.ACTIVE_TASKS_SET_SEARCH_TERM,
        options: searchTerm
      });
    },
    sortByColumnHeader: function (columnName) {
      FauxtonAPI.dispatch({
        type: ActionTypes.ACTIVE_TASKS_SORT_BY_COLUMN_HEADER,
        options: {
          columnName: columnName
        }
      });
    },
    setActiveTaskIsLoading: function (boolean) {
      FauxtonAPI.dispatch({
        type: ActionTypes.ACTIVE_TASKS_SET_IS_LOADING,
        options: boolean
      });
    }
  };
});
