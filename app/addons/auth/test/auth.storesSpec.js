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
  '../../../core/api',
  'react',
  '../../../../test/mocha/testUtils',
  '../actiontypes',
  '../stores'
], function (FauxtonAPI, React, testUtils, ActionTypes, Stores) {
  var assert = testUtils.assert;

  var changePasswordStore = Stores.changePasswordStore;
  var createAdminStore = Stores.createAdminStore;
  var createAdminSidebarStore = Stores.createAdminSidebarStore;

  describe('Auth Stores', function () {

    describe('ChangePasswordStore', function () {

      it('get / set change password updates store', function () {
        // check empty by default
        assert.equal(changePasswordStore.getChangePassword(), '');

        var newPassword = 'lets-rick-roll-mocha';
        FauxtonAPI.dispatch({
          type: ActionTypes.AUTH_UPDATE_CHANGE_PWD_FIELD,
          value: newPassword
        });
        assert.equal(changePasswordStore.getChangePassword(), newPassword);
      });

      it('clearing change password clears in store', function () {
        var newPassword = 'never-gonna-give-you-up';
        FauxtonAPI.dispatch({
          type: ActionTypes.AUTH_UPDATE_CHANGE_PWD_FIELD,
          value: newPassword
        });
        assert.equal(changePasswordStore.getChangePassword(), newPassword);

        FauxtonAPI.dispatch({ type: ActionTypes.AUTH_CLEAR_CHANGE_PWD_FIELDS });
        assert.equal(changePasswordStore.getChangePassword(), '');
      });

      it('get / set change confirm password updates store', function () {
        // check empty by default
        assert.equal(changePasswordStore.getChangePasswordConfirm(), '');

        // check getPassword works
        var newPassword = 'never-gonna-let-you-down';
        FauxtonAPI.dispatch({
          type: ActionTypes.AUTH_UPDATE_CHANGE_PWD_CONFIRM_FIELD,
          value: newPassword
        });
        assert.equal(changePasswordStore.getChangePasswordConfirm(), newPassword);
      });

      it('clearing change confirm password clears in store', function () {
        var newPassword = 'never-gonna-run-around-and-desert-you';
        FauxtonAPI.dispatch({
          type: ActionTypes.AUTH_UPDATE_CHANGE_PWD_CONFIRM_FIELD,
          value: newPassword
        });
        assert.equal(changePasswordStore.getChangePasswordConfirm(), newPassword);

        FauxtonAPI.dispatch({ type: ActionTypes.AUTH_CLEAR_CHANGE_PWD_FIELDS });
        assert.equal(changePasswordStore.getChangePasswordConfirm(), '');
      });
    });


    describe('CreateAdminStore', function () {

      it('get / set username updates store', function () {
        assert.equal(createAdminStore.getUsername(), '');

        var newUsername = 'never-gonna-make-you-cry';
        FauxtonAPI.dispatch({
          type: ActionTypes.AUTH_UPDATE_CREATE_ADMIN_USERNAME_FIELD,
          value: newUsername
        });
        assert.equal(createAdminStore.getUsername(), newUsername);
      });

      it('clearing username clears in store', function () {
        var newUsername = 'never-gonna-say-goodbye';
        FauxtonAPI.dispatch({
          type: ActionTypes.AUTH_UPDATE_CREATE_ADMIN_USERNAME_FIELD,
          value: newUsername
        });
        assert.equal(createAdminStore.getUsername(), newUsername);

        FauxtonAPI.dispatch({ type: ActionTypes.AUTH_CLEAR_CREATE_ADMIN_FIELDS });
        assert.equal(createAdminStore.getUsername(), '');
      });

      it('get / set password updates store', function () {
        // check empty by default
        assert.equal(createAdminStore.getPassword(), '');

        // check getPassword works
        var newPassword = 'never-gonna-tell-a-lie-and-hurt-you';
        FauxtonAPI.dispatch({
          type: ActionTypes.AUTH_UPDATE_CREATE_ADMIN_PWD_FIELD,
          value: newPassword
        });
        assert.equal(createAdminStore.getPassword(), newPassword);
      });

      it('clearing change confirm password clears in store', function () {
        var newPassword = 'mocha-please-consider-yourself-rickrolled';
        FauxtonAPI.dispatch({
          type: ActionTypes.AUTH_UPDATE_CREATE_ADMIN_PWD_FIELD,
          value: newPassword
        });
        assert.equal(createAdminStore.getPassword(), newPassword);

        FauxtonAPI.dispatch({ type: ActionTypes.AUTH_CLEAR_CREATE_ADMIN_FIELDS });
        assert.equal(createAdminStore.getPassword(), '');
      });
    });


    describe('CreateAdminSidebarStore', function () {
      var defaultPage = 'changePassword';
      it('has correct default selected page', function () {
        assert.equal(createAdminSidebarStore.getSelectedPage(), defaultPage);
      });

      it('selecting a page updates the selected page in store', function () {
        var newPage = 'addAdmin';
        FauxtonAPI.dispatch({ type: ActionTypes.AUTH_SELECT_PAGE, page: newPage });
        assert.equal(createAdminSidebarStore.getSelectedPage(), newPage);
      });
    });

  });

});
