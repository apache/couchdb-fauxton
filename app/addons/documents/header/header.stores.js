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
  'addons/documents/header/header.actiontypes'
],

function (FauxtonAPI, ActionTypes) {
  var Stores = {};

  Stores.AlternativeHeaderBarStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._collapsedDocuments = false;
      this._selectedAllDocuments = false;
    },

    toggleCollapse: function () {
      this._collapsedDocuments = !this._collapsedDocuments;
    },

    getCollapsedState: function () {
      return this._collapsedDocuments;
    },

    toggleSelectAll: function () {
      this._selectedAllDocuments = !this._selectedAllDocuments;
    },

    getSelectedAllState: function () {
      return this._selectedAllDocuments;
    },

    dispatch: function (action) {
      switch (action.type) {

        case ActionTypes.COLLAPSE_DOCUMENTS:
          this.toggleCollapse();
          this.triggerChange();
        break;

        case ActionTypes.SELECT_ALL_DOCUMENTS:
          this.toggleSelectAll();
          this.triggerChange();
        break;

        case ActionTypes.RESET_HEADER_BAR:
          this.reset();
          this.triggerChange();
        break;

        default:
          return;
      }
    }

  });

  Stores.HeaderBarStore = FauxtonAPI.Store.extend({
    initialize: function (options) {
      this.reset();
    },

    reset: function () {
      this._isToggled = false;
    },

    toogleStatus: function () {
      this._isToggled = !this._isToggled;
    },

    toggleClass: function () {
      this._toggleClass = '';

      if (this._isToggled) {
        this._toggleClass = 'js-headerbar-togglebutton-selected';
      }
    },

    getStatus: function () {
      return this._isToggled;
    },

    getToggleClass: function () {
      return this._toggleClass;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.TOGGLE_HEADER_CONTROLS:
          this.toogleStatus();
          this.toggleClass();
          this.triggerChange();
        break;

        case ActionTypes.RESET_HEADER_BAR:
          this.reset();
          this.toggleClass();
          this.triggerChange();
        break;

        default:
          return;
      }
    }
  });

  Stores.headerBarStore = new Stores.HeaderBarStore();
  Stores.headerBarStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.headerBarStore.dispatch);

  Stores.alternativeHeaderBarStore = new Stores.AlternativeHeaderBarStore();
  Stores.alternativeHeaderBarStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.alternativeHeaderBarStore.dispatch);

  return Stores;
});
