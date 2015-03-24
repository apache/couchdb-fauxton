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
  'addons/documents/header/header.actiontypes',
  'addons/documents/index-results/actiontypes'
],

function (FauxtonAPI, ActionTypes, IndexResultsActions) {
  var Stores = {};

  Stores.HeaderBarStore = FauxtonAPI.Store.extend({
    initialize: function (options) {
      this.reset();
    },

    reset: function () {
      this._toggleClass = '';
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

    getToggleStatus: function () {
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

  return Stores;
});
