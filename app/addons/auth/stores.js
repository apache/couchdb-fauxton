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
  '../../app',
  '../../core/api',
  './actiontypes'
], function (app, FauxtonAPI, ActionTypes) {


  // Not thrilled with this. The sole purpose of these next two stores is because the Create Admin + Change Password
  // forms need to clear after a successful post. Since those events occur in actions.js, we need a way to tell the
  // component to update + clear the fields. That's why all this code exists.

  var ChangePasswordStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._changePassword = '';
      this._changePasswordConfirm = '';
    },

    getChangePassword: function () {
      return this._changePassword;
    },

    getChangePasswordConfirm: function () {
      return this._changePasswordConfirm;
    },

    setChangePassword: function (val) {
      this._changePassword = val;
    },

    setChangePasswordConfirm: function (val) {
      this._changePasswordConfirm = val;
    },

    dispatch: function (action) {
      switch (action.type) {

        case ActionTypes.AUTH_CLEAR_CHANGE_PWD_FIELDS:
          this.reset();
          this.triggerChange();
        break;

        case ActionTypes.AUTH_UPDATE_CHANGE_PWD_FIELD:
          this.setChangePassword(action.value);
          this.triggerChange();
        break;

        case ActionTypes.AUTH_UPDATE_CHANGE_PWD_CONFIRM_FIELD:
          this.setChangePasswordConfirm(action.value);
          this.triggerChange();
        break;

        default:
        return;
      }
    }
  });

  var changePasswordStore = new ChangePasswordStore();
  changePasswordStore.dispatchToken = FauxtonAPI.dispatcher.register(changePasswordStore.dispatch.bind(changePasswordStore));


  var CreateAdminStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._username = '';
      this._password = '';
    },

    getUsername: function () {
      return this._username;
    },

    getPassword: function () {
      return this._password;
    },

    setUsername: function (val) {
      this._username = val;
    },

    setPassword: function (val) {
      this._password = val;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.AUTH_CLEAR_CREATE_ADMIN_FIELDS:
          this.reset();
          this.triggerChange();
        break;

        case ActionTypes.AUTH_UPDATE_CREATE_ADMIN_USERNAME_FIELD:
          this.setUsername(action.value);
          this.triggerChange();
        break;

        case ActionTypes.AUTH_UPDATE_CREATE_ADMIN_PWD_FIELD:
          this.setPassword(action.value);
          this.triggerChange();
        break;

        default:
        return;
      }
    }
  });

  var createAdminStore = new CreateAdminStore();
  createAdminStore.dispatchToken = FauxtonAPI.dispatcher.register(createAdminStore.dispatch.bind(createAdminStore));


  var CreateAdminSidebarStore = FauxtonAPI.Store.extend({
    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._selectedPage = 'changePassword';
    },

    getSelectedPage: function () {
      return this._selectedPage;
    },

    setSelectedPage: function (val) {
      this._selectedPage = val;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.AUTH_SELECT_PAGE:
          this.setSelectedPage(action.page);
          this.triggerChange();
        break;

        default:
        return;
      }
    }
  });

  var createAdminSidebarStore = new CreateAdminSidebarStore();
  createAdminSidebarStore.dispatchToken = FauxtonAPI.dispatcher.register(createAdminSidebarStore.dispatch.bind(createAdminSidebarStore));


  return {
    changePasswordStore: changePasswordStore,
    createAdminStore: createAdminStore,
    createAdminSidebarStore: createAdminSidebarStore
  };

});
