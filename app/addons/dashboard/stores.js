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
  'addons/dashboard/actiontypes'
], function (app, FauxtonAPI, ActionTypes) {

  var DashboardStore = FauxtonAPI.Store.extend({

    dashboardWidgetActiveTaskInitialize: function (collectionTable, backboneCollection) {
      this.reset(collectionTable, backboneCollection);
    },

    reset: function (collectionTable, backboneCollection) {
      this._prevSortbyHeader = 'started_on';
      this._headerIsAscending = true;
      this._sortByHeader = 'started_on';
      this._collection = collectionTable;
      this._pollingIntervalSeconds = 5;
      this.sortCollectionByColumnHeader(this._sortByHeader);
      this._backboneCollection = backboneCollection;
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

    setCollection: function (collection) {
      this._collection = collection;
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
        return item.type ===  'replication';
      }, this);

      return table;
    },

    dispatch: function (action) {
      switch (action.type) {

        case ActionTypes.ACTIVE_TASKS_FETCH_AND_SET:
          this.dashboardWidgetActiveTaskInitialize(action.options.collectionTable, action.options.backboneCollection);
        break;

        case ActionTypes.ACTIVE_TASKS_SET_COLLECTION:
          this.setCollection(action.options);
          this.triggerChange();
        break;

        case ActionTypes.ACTIVE_TASKS_SET_POLLING:
          this.setPolling();
          this.triggerChange();
        break;

        case ActionTypes.ACTIVE_TASKS_CLEAR_POLLING:
          this.clearPolling();
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
