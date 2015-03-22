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
  'addons/documents/changes/actiontypes'
], function (FauxtonAPI, ActionTypes) {


  var ChangesStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._tabVisible = false;
      this._filters = [];
      this._changes = [];
      this._databaseName = '';
      this._maxChangesListed = 100;
      this._showingSubset = false;
    },

    setChanges: function (options) {
      this._filters = options.filters;
      this._databaseName = options.databaseName;
      this._changes = _.map(options.changes.models, function (change) {
        return {
          id: change.get('id'),
          seq: change.get('seq'),
          deleted: change.get('deleted') ? change.get('deleted') : false,
          changes: change.get('changes'),
          doc: change.get('doc') // only populated with ?include_docs=true
        };
      });
    },

    getChanges: function () {
      this._showingSubset = false;
      var numMatches = 0;

      return _.filter(this._changes, function (change) {
        if (numMatches >= this._maxChangesListed) {
          this._showingSubset = true;
          return false;
        }
        var changeStr = JSON.stringify(change);
        var match = _.every(this._filters, function (filter) {
          return new RegExp(filter, 'i').test(changeStr);
        });

        if (match) {
          numMatches++;
        }
        return match;
      }, this);
    },

    toggleTabVisibility: function () {
      this._tabVisible = !this._tabVisible;
    },

    isTabVisible: function () {
      return this._tabVisible;
    },

    addFilter: function (filter) {
      this._filters.push(filter);
    },

    removeFilter: function (filter) {
      this._filters = _.without(this._filters, filter);
    },

    getFilters: function () {
      return this._filters;
    },

    hasFilter: function (filter) {
      return _.contains(this._filters, filter);
    },

    getDatabaseName: function () {
      return this._databaseName;
    },

    isShowingSubset: function () {
      return this._showingSubset;
    },

    // added to speed up the tests
    setMaxChanges: function (num) {
      this._maxChangesListed = num;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.SET_CHANGES:
          this.setChanges(action.options);
          this.triggerChange();
        break;
        case ActionTypes.TOGGLE_CHANGES_TAB_VISIBILITY:
          this.toggleTabVisibility();
          this.triggerChange();
        break;
        case ActionTypes.ADD_CHANGES_FILTER_ITEM:
          this.addFilter(action.filter);
          this.triggerChange();
        break;
        case ActionTypes.REMOVE_CHANGES_FILTER_ITEM:
          this.removeFilter(action.filter);
          this.triggerChange();
        break;
      }
    }
  });


  var Stores = {};
  Stores.changesStore = new ChangesStore();
  Stores.changesStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.changesStore.dispatch);

  return Stores;
});
