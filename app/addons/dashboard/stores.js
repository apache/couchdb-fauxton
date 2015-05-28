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
  'addons/activetasks/actiontypes'
], function (app, FauxtonAPI, ActionTypes) {

  var DashboardStore = FauxtonAPI.Store.extend({

    dashboardWidgetActiveTaskInitialize: function (collectionTable, backboneCollection) {
      this.reset(collectionTable, backboneCollection);
    },

    reset: function (collectionTable, backboneCollection) {
      this._prevSortbyHeader = 'started_on';
      this._headerIsAscending = true;
      this._selectedRadio = 'All Tasks';
      this._sortByHeader = 'started_on';
      this._searchTerm = '';
      this._collection = collectionTable;
      this._pollingIntervalSeconds = 5;
      this.sortCollectionByColumnHeader(this._sortByHeader);
      this._backboneCollection = backboneCollection;
    },

    getSelectedRadio: function () {
      return this._selectedRadio;
    },

    setSelectedRadio: function (selectedRadio) {
      this._selectedRadio = selectedRadio;
    },

    getPollingInterval: function () {
      return this._pollingIntervalSeconds;
    },

    setPollingInterval: function (pollingInterval) {
      this._pollingIntervalSeconds = pollingInterval;
    },

    setPolling: function () {
      clearInterval(this.getIntervalID());
      this._intervalID = setInterval(function () {
        this._backboneCollection.pollingFetch();
        this._collection = this._backboneCollection.table;
        this.sortCollectionByColumnHeader(this._prevSortbyHeader, false);
        this.triggerChange();
      }.bind(this), this.getPollingInterval() * 1000);
    },

    clearPolling: function () {
      clearInterval(this.getIntervalID());
    },

    getIntervalID: function () {
      return this._intervalID;
    },

    getCollection: function () {
      return this._collection;
    },

    sortCollectionByColumnHeader: function (colName) {
      var sorted = _.sortBy(this._collection, function (item) {
        var variable = colName;

        if (_.isUndefined(item[variable])) {
          variable = 'source';
        }
        return item[variable];
      });

      this._prevSortbyHeader = colName;
      this._collection = sorted;
    },

    getFilteredTable: function (collection) {
      //sort the table here
      this.sortCollectionByColumnHeader(this._sortByHeader);

      //insert all matches into table
      var table = this._collection.filter(function (item) {
        return this.passesRadioFilter(item) && this.passesSearchFilter(item);
      }, this);

      return table;
    },

    passesSearchFilter: function (item) {
      var regex = new RegExp(this._searchTerm, 'g');

      var itemDatabasesTerm = '';
      if (_.has(item, 'database')) {
        itemDatabasesTerm += item.database;
      }
      if (_.has(item, 'source')) {
        itemDatabasesTerm += item.source;
      }
      if (_.has(item, 'target')) {
        itemDatabasesTerm += item.target;
      }

      return regex.test(itemDatabasesTerm);
    },

    passesRadioFilter: function (item) {
      var selectedRadio = this._selectedRadio.toLowerCase().replace(' ', '_') ;
      return item.type ===  selectedRadio ||  selectedRadio === 'all_tasks';
    },

    dispatch: function (action) {
      switch (action.type) {

        case ActionTypes.ACTIVE_TASKS_INIT:
          this.dashboardWidgetActiveTaskInitialize(action.options.collectionTable, action.options.backboneCollection);
        break;

        case ActionTypes.ACTIVE_TASKS_CHANGE_POLLING_INTERVAL:
          this.setPollingInterval(action.options);
          this.setPolling();
          this.triggerChange();
        break;

        default:
        return;
      }
    }
  });

  var dashboardStore = new DashboardStore();
  dashboardStore.dispatchToken = FauxtonAPI.dispatcher.register(dashboardStore.dispatch.bind(dashboardStore));
  return {
    dashboardStore: dashboardStore
  };

});
