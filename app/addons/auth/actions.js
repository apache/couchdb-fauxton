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
  '../cluster/cluster.stores'
],
function (FauxtonAPI, ActionTypes, ClusterStore) {

  var nodesStore = ClusterStore.nodesStore;

  var errorHandler = function (xhr, type, msg) {
    msg = xhr;
    if (arguments.length === 3) {
      msg = xhr.responseJSON.reason;
    }

    FauxtonAPI.addNotification({
      msg: msg,
      type: 'error'
    });
  };


  return {

    login: function (username, password, urlBack) {
      var promise = FauxtonAPI.session.login(username, password);

      promise.then(function () {
        FauxtonAPI.addNotification({ msg: FauxtonAPI.session.messages.loggedIn });
        if (urlBack) {
          return FauxtonAPI.navigate(urlBack);
        }
        FauxtonAPI.navigate('/');
      });
      promise.fail(errorHandler);
    },

    changePassword: function (password, passwordConfirm) {
      var nodes = nodesStore.getNodes();
      var promise = FauxtonAPI.session.changePassword(password, passwordConfirm, nodes[0].node);

      promise.done(function () {
        FauxtonAPI.addNotification({ msg: FauxtonAPI.session.messages.changePassword });
        FauxtonAPI.dispatch({ type: ActionTypes.AUTH_CLEAR_CHANGE_PWD_FIELDS });
      });

      promise.fail(errorHandler);
    },

    updateChangePasswordField: function (value) {
      FauxtonAPI.dispatch({
        type: ActionTypes.AUTH_UPDATE_CHANGE_PWD_FIELD,
        value: value
      });
    },

    updateChangePasswordConfirmField: function (value) {
      FauxtonAPI.dispatch({
        type: ActionTypes.AUTH_UPDATE_CHANGE_PWD_CONFIRM_FIELD,
        value: value
      });
    },

    createAdmin: function (username, password, loginAfter) {
      var nodes = nodesStore.getNodes();
      var promise = FauxtonAPI.session.createAdmin(username, password, loginAfter, nodes[0].node);

      promise.then(function () {
        FauxtonAPI.addNotification({ msg: FauxtonAPI.session.messages.adminCreated });
        if (loginAfter) {
          FauxtonAPI.navigate('/');
        } else {
          FauxtonAPI.dispatch({ type: ActionTypes.AUTH_CLEAR_CREATE_ADMIN_FIELDS });
        }
      });

      promise.fail(function (xhr, type, msg) {
        msg = xhr;
        if (arguments.length === 3) {
          msg = xhr.responseJSON.reason;
        }
        errorHandler(FauxtonAPI.session.messages.adminCreationFailedPrefix + ' ' + msg);
      });
    },

    updateCreateAdminUsername: function (value) {
      FauxtonAPI.dispatch({
        type: ActionTypes.AUTH_UPDATE_CREATE_ADMIN_USERNAME_FIELD,
        value: value
      });
    },

    updateCreateAdminPassword: function (value) {
      FauxtonAPI.dispatch({
        type: ActionTypes.AUTH_UPDATE_CREATE_ADMIN_PWD_FIELD,
        value: value
      });
    },

    selectPage: function (page) {
      FauxtonAPI.dispatch({
        type: ActionTypes.AUTH_SELECT_PAGE,
        page: page
      });
    }

  };

});
