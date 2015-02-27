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

  var Stores = {};


  // tracks the state of the header (open/closed)
  var ChangesHeaderStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._tabVisible = false;
    },

    toggleTabVisibility: function () {
      this._tabVisible = !this._tabVisible;
    },

    isTabVisible: function () {
      return this._tabVisible;
    },

    dispatch: function (action) {

      // can I use an if-statement for a single item?
      switch (action.type) {
        case ActionTypes.TOGGLE_CHANGES_TAB_VISIBILITY:
          this.toggleTabVisibility();
          this.triggerChange();
          break;
      }
    }
  });

  Stores.changesHeaderStore = new ChangesHeaderStore();
  Stores.changesHeaderStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.changesHeaderStore.dispatch);


  // tracks the list of filters
  var ChangesFilterStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._filters = [];
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

    dispatch: function (action) {
      switch (action.type) {
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

  Stores.changesFilterStore = new ChangesFilterStore();
  Stores.changesFilterStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.changesFilterStore.dispatch);


  // store for the individual changes row. This isn't instantiated here, but for each row
  Stores.ChangeStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._codeVisible = false;
      this._jsonBtnLabel = 'View JSON';
    },

    toggleCodeVisibility: function () {
      this._codeVisible = !this._codeVisible;
      this._jsonBtnLabel = (this._codeVisible) ? 'Close JSON' : 'ViewJSON';
    },

    isCodeVisible: function () {
      return this._codeVisible;
    },

    getJsonBtnLabel: function () {
      return this._jsonBtnLabel;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.TOGGLE_CHANGES_CODE_VISIBILITY:
          this.toggleCodeVisibility();
          this.triggerChange();
          break;
      }
    }
  });


  return Stores;
});
