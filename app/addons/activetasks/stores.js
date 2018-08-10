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

import FauxtonAPI from "../../core/api";
import ActionTypes from "./actiontypes";

var ActiveTasksStore = FauxtonAPI.Store.extend({
  initialize () {
    this._prevSortbyHeader = 'started-on';
    this._headerIsAscending = true;
    this._selectedRadio = 'All Tasks';
    this._sortByHeader = 'started-on';
    this._searchTerm = '';
    this._pollingIntervalSeconds = 5;

  },

  initAfterFetching (collectionTable, backboneCollection) {
    this._collection = collectionTable;
    this.sortCollectionByColumnHeader(this._sortByHeader);
    this._backboneCollection = backboneCollection;
    this.setIsLoading(true, new Date());
  },

  isLoading () {
    return this._isLoading;
  },

  setIsLoading (bool, time) {
    if (bool) {
      this._startTimeForLoading = time;
      this._isLoading = true;
    } else {
      var stoptime = time;
      var responseTime = stoptime - this._startTimeForLoading;
      if (responseTime < 800) {
        setTimeout(function () {
          this._isLoading = false;
          this.triggerChange();
        }.bind(this), 800);  //stop after 800ms for smooth animation
      } else {
        this._isLoading = false;
      }
    }
  },

  getSelectedRadio () {
    return this._selectedRadio;
  },

  setSelectedRadio (selectedRadio) {
    this._selectedRadio = selectedRadio;
  },

  setCollectionFromPolling (collection) {
    this.setCollection(collection);
    this.sortCollectionByColumnHeader(this._prevSortbyHeader, false);
  },

  setCollection (collection) {
    this._collection = collection;
  },

  getCollection () {
    return this._collection;
  },

  getBackboneCollection () {
    return this._backboneCollection;
  },

  setSearchTerm (searchTerm) {
    this._searchTerm = searchTerm;
  },

  getSearchTerm () {
    return this._searchTerm;
  },

  getSortByHeader () {
    return this._sortByHeader;
  },

  setSortByHeader (header) {
    this._sortByHeader = header;
  },

  getHeaderIsAscending () {
    return this._headerIsAscending;
  },

  toggleHeaderIsAscending () {
    if (this._prevSortbyHeader === this._sortByHeader) {
      this._headerIsAscending = !this._headerIsAscending;
      return;
    }

    this._headerIsAscending = true;
  },

  sortCollectionByColumnHeader (colName) {
    var collectionTable = this._collection;

    var sorted = _.sortBy(collectionTable, (item) => {
      var variable = colName;

      if (_.isUndefined(item[variable])) {
        variable = 'source';
      }
      return item[variable];
    });

    this._prevSortbyHeader = colName;
    this._collection = sorted;
  },

  getFilteredTable () {
    var table = [];

    //sort the table here
    this.sortCollectionByColumnHeader(this._sortByHeader);

    //insert all matches into table
    this._collection.map(function (item) {
      var passesRadioFilter = this.passesRadioFilter(item);
      var passesSearchFilter = this.passesSearchFilter(item);

      if (passesRadioFilter && passesSearchFilter) {
        table.push(item);
      }
    }.bind(this));

    // reverse if descending
    if (!this._headerIsAscending) {
      table.reverse();
    }

    return table;
  },

  passesSearchFilter (item) {
    var searchTerm = this._searchTerm;
    var regex = new RegExp(searchTerm, 'g');

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

  passesRadioFilter (item) {
    var selectedRadio = this._selectedRadio.toLowerCase().replace(' ', '_');
    return item.type ===  selectedRadio ||  selectedRadio === 'all_tasks';
  },

  dispatch (action) {
    switch (action.type) {

      case ActionTypes.ACTIVE_TASKS_FETCH_AND_SET:
        this.initAfterFetching(action.options.collectionTable, action.options.backboneCollection);
        break;

      case ActionTypes.ACTIVE_TASKS_SWITCH_TAB:
        this.setSelectedRadio(action.options);
        this.triggerChange();
        break;

      case ActionTypes.ACTIVE_TASKS_SET_COLLECTION:
        this.setCollection(action.options);
        this.triggerChange();
        break;

      case ActionTypes.ACTIVE_TASKS_SET_SEARCH_TERM:
        this.setSearchTerm(action.options);
        this.triggerChange();
        break;

      case ActionTypes.ACTIVE_TASKS_SORT_BY_COLUMN_HEADER:
        this.toggleHeaderIsAscending();
        this.setSortByHeader(action.options.columnName);
        this.sortCollectionByColumnHeader(action.options.columnName);
        this.triggerChange();
        break;

      case ActionTypes.ACTIVE_TASKS_SET_IS_LOADING:
        this.setIsLoading(action.options, new Date());
        this.triggerChange();
        break;

      case ActionTypes.ACTIVE_TASKS_POLLING_COLLECTION:
        this.setCollectionFromPolling(action.options);
        this.triggerChange();
        break;

      default:
        return;
    }
  }
});

var activeTasksStore = new ActiveTasksStore();
activeTasksStore.dispatchToken = FauxtonAPI.dispatcher.register(activeTasksStore.dispatch.bind(activeTasksStore));

export default {
  activeTasksStore: activeTasksStore
};
