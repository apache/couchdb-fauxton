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
  '../../core/api',
  './actiontypes'
],

function (FauxtonAPI, ActionTypes) {
  var Stores = {};

  Stores.PermissionsStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this._isLoading = true;
    },

    isLoading: function () {
      return this._isLoading;
    },

    editPermissions: function (database, security) {
      this._database = database;
      this._security = security;
      this._isLoading = false;
    },

    getItem: function (section, type) {
      if (this._isLoading) {return [];}

      return this._security.get(section)[type];
    },

    getDatabase: function () {
      return this._database;
    },

    getSecurity: function () {
      return this._security;
    },

    getAdminRoles: function () {
      return this.getItem('admins', 'roles');
    },

    getAdminNames: function () {
      return this.getItem('admins', 'names');
    },

    getMemberNames: function () {
      return this.getItem('members', 'names');
    },

    getMemberRoles: function () {
      return this.getItem('members', 'roles');
    },

    addItem: function (options) {
      this._security.addItem(options.value, options.type, options.section);
    },

    removeItem: function (options) {
      this._security.removeItem(options.value, options.type, options.section);
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.PERMISSIONS_FETCHING:
          this._isLoading = true;
          this.triggerChange();
        break;

        case ActionTypes.PERMISSIONS_EDIT:
          this.editPermissions(action.database, action.security);
          this.triggerChange();
        break;

        case ActionTypes.PERMISSIONS_ADD_ITEM:
          this.addItem(action.options);
          this.triggerChange();
        break;

        case ActionTypes.PERMISSIONS_REMOVE_ITEM:
          this.removeItem(action.options);
          this.triggerChange();
        break;

        default:
        return;
        // do nothing
      }
    }

  });

  Stores.permissionsStore = new Stores.PermissionsStore();

  Stores.permissionsStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.permissionsStore.dispatch);

  return Stores;
});
