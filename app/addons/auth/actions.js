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
import ClusterStore from "../cluster/cluster.stores";

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


function login (username, password, urlBack) {
  var promise = FauxtonAPI.session.login(username, password);

  promise.then(() => {
    FauxtonAPI.addNotification({ msg: FauxtonAPI.session.messages.loggedIn });
    if (urlBack) {
      return FauxtonAPI.navigate(urlBack);
    }
    FauxtonAPI.navigate('/');
  }, errorHandler);
}

function changePassword (password, passwordConfirm) {
  var nodes = nodesStore.getNodes();
  var promise = FauxtonAPI.session.changePassword(password, passwordConfirm, nodes[0].node);

  promise.then(() => {
    FauxtonAPI.addNotification({ msg: FauxtonAPI.session.messages.changePassword });
    FauxtonAPI.dispatch({ type: ActionTypes.AUTH_CLEAR_CHANGE_PWD_FIELDS });
  }, errorHandler);
}

function updateChangePasswordField (value) {
  FauxtonAPI.dispatch({
    type: ActionTypes.AUTH_UPDATE_CHANGE_PWD_FIELD,
    value: value
  });
}

function updateChangePasswordConfirmField (value) {
  FauxtonAPI.dispatch({
    type: ActionTypes.AUTH_UPDATE_CHANGE_PWD_CONFIRM_FIELD,
    value: value
  });
}

function createAdmin (username, password, loginAfter) {
  var nodes = nodesStore.getNodes();
  var promise = FauxtonAPI.session.createAdmin(username, password, loginAfter, nodes[0].node);

  promise.then(() => {
    FauxtonAPI.addNotification({ msg: FauxtonAPI.session.messages.adminCreated });
    if (loginAfter) {
      FauxtonAPI.navigate('/');
    } else {
      FauxtonAPI.dispatch({ type: ActionTypes.AUTH_CLEAR_CREATE_ADMIN_FIELDS });
    }
  }, (xhr, type, msg) => {
    msg = xhr;
    if (arguments.length === 3) {
      msg = xhr.responseJSON.reason;
    }
    errorHandler(FauxtonAPI.session.messages.adminCreationFailedPrefix + ' ' + msg);
  });
}

// simple authentication method - does nothing other than check creds
function authenticate (username, password, onSuccess) {
  $.ajax({
    cache: false,
    type: 'POST',
    url: '/_session',
    dataType: 'json',
    data: { name: username, password: password }
  }).then(() => {
    FauxtonAPI.dispatch({
      type: ActionTypes.AUTH_CREDS_VALID,
      options: { username: username, password: password }
    });
    hidePasswordModal();
    onSuccess(username, password);
  }, () => {
    FauxtonAPI.addNotification({
      msg: 'Your password is incorrect.',
      type: 'error',
      clear: true
    });
    FauxtonAPI.dispatch({
      type: ActionTypes.AUTH_CREDS_INVALID,
      options: { username: username, password: password }
    });
  });
}

function updateCreateAdminUsername (value) {
  FauxtonAPI.dispatch({
    type: ActionTypes.AUTH_UPDATE_CREATE_ADMIN_USERNAME_FIELD,
    value: value
  });
}

function updateCreateAdminPassword (value) {
  FauxtonAPI.dispatch({
    type: ActionTypes.AUTH_UPDATE_CREATE_ADMIN_PWD_FIELD,
    value: value
  });
}

function selectPage (page) {
  FauxtonAPI.dispatch({
    type: ActionTypes.AUTH_SELECT_PAGE,
    page: page
  });
}

function showPasswordModal () {
  FauxtonAPI.dispatch({ type: ActionTypes.AUTH_SHOW_PASSWORD_MODAL });
}

function hidePasswordModal () {
  FauxtonAPI.dispatch({ type: ActionTypes.AUTH_HIDE_PASSWORD_MODAL });
}


export default {
  login,
  changePassword,
  updateChangePasswordField,
  updateChangePasswordConfirmField,
  createAdmin,
  authenticate,
  updateCreateAdminUsername,
  updateCreateAdminPassword,
  selectPage,
  showPasswordModal,
  hidePasswordModal
};
