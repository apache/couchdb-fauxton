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
  './actiontypes',
  './stores'
],

function (FauxtonAPI, ActionTypes, Stores) {
  var permissionsStore = Stores.permissionsStore;
  return {

    fetchPermissions: function (database, security) {
      FauxtonAPI.dispatch({
        type: ActionTypes.PERMISSIONS_FETCHING,
        database: database,
        security: security
      });

      FauxtonAPI.when([database.fetch(), security.fetch()]).then(function () {
        this.editPermissions(database, security);
      }.bind(this));
    },

    editPermissions: function (database, security) {
      FauxtonAPI.dispatch({
        type: ActionTypes.PERMISSIONS_EDIT,
        database: database,
        security: security
      });
    },
    addItem: function (options) {
      var check = permissionsStore.getSecurity().canAddItem(options.value, options.type, options.section);

      if (check.error) {
        FauxtonAPI.addNotification({
          msg: check.msg,
          type: 'error'
        });

        return;
      }

      FauxtonAPI.dispatch({
        type: ActionTypes.PERMISSIONS_ADD_ITEM,
        options: options
      });

      this.savePermissions();

    },
    removeItem: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.PERMISSIONS_REMOVE_ITEM,
        options: options
      });
      this.savePermissions();
    },

    savePermissions: function () {
      permissionsStore.getSecurity().save().then(function () {
        FauxtonAPI.addNotification({
          msg: 'Database permissions has been updated.'
        });
      }, function (xhr) {
        if (!xhr && !xhr.responseJSON) { return;}

        FauxtonAPI.addNotification({
          msg: 'Could not update permissions - reason: ' + xhr.responseJSON.reason,
          type: 'error'
        });
      });
    }
  };
});
