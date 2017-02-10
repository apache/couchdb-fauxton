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
import { session } from "../../core/couchdb";
import {
  AUTH_CLEAR_CHANGE_PWD_FIELDS,
  AUTH_UPDATE_CHANGE_PWD_FIELD,
  AUTH_UPDATE_CHANGE_PWD_CONFIRM_FIELD,
  AUTH_CLEAR_CREATE_ADMIN_FIELDS,
  AUTH_CREDS_VALID,
  AUTH_CREDS_INVALID,
  AUTH_UPDATE_CREATE_ADMIN_USERNAME_FIELD,
  AUTH_UPDATE_CREATE_ADMIN_PWD_FIELD,
  AUTH_SELECT_PAGE,
  AUTH_SHOW_PASSWORD_MODAL,
  AUTH_HIDE_PASSWORD_MODAL
} from "./actiontypes";
import ClusterStore from "../cluster/cluster.stores";

const nodesStore = ClusterStore.nodesStore;

function errorHandler({ message }) {
  FauxtonAPI.addNotification({
    msg: message,
    type: "error"
  });
};

export function login(username, password, urlBack) {
  return FauxtonAPI.session.login(username, password)
    .then(() => {
      FauxtonAPI.addNotification({ msg: FauxtonAPI.session.messages.loggedIn });
      if (urlBack && !urlBack.includes("login")) {
        return FauxtonAPI.navigate(urlBack);
      }
      FauxtonAPI.navigate("/");
    })
    .catch(errorHandler);
}

export function changePassword(password, passwordConfirm) {
  var nodes = nodesStore.getNodes();
  var promise = FauxtonAPI.session.changePassword(
    password,
    passwordConfirm,
    nodes[0].node
  );

  promise.then(
    () => {
      FauxtonAPI.addNotification({
        msg: FauxtonAPI.session.messages.changePassword
      });
      FauxtonAPI.dispatch({ type: AUTH_CLEAR_CHANGE_PWD_FIELDS });
    },
    errorHandler
  );
}

export function updateChangePasswordField(value) {
  FauxtonAPI.dispatch({
    type: AUTH_UPDATE_CHANGE_PWD_FIELD,
    value: value
  });
}

export function updateChangePasswordConfirmField(value) {
  FauxtonAPI.dispatch({
    type: AUTH_UPDATE_CHANGE_PWD_CONFIRM_FIELD,
    value: value
  });
}

export const createAdmin = (username, password, loginAfter) => {
  const nodes = nodesStore.getNodes();
  FauxtonAPI.session.createAdmin(
    username,
    password,
    loginAfter,
    nodes[0].node
  )
  .then(
    () => {
      FauxtonAPI.addNotification({
        msg: FauxtonAPI.session.messages.adminCreated
      });
      if (loginAfter) {
        return FauxtonAPI.navigate("/");
      } else {
        FauxtonAPI.dispatch({ type: AUTH_CLEAR_CREATE_ADMIN_FIELDS });
      }
    },
    (xhr, type, msg) => {
      msg = xhr;
      if (arguments.length === 3) {
        msg = xhr.responseJSON.reason;
      }
      errorHandler(
        `${FauxtonAPI.session.messages.adminCreationFailedPrefix} ${msg}`
      );
    }
  );
};

// simple authentication method - does nothing other than check creds
export function authenticate(username, password, onSuccess) {
  session
    .create({
      name: username,
      password: password
    })
    .then(
      () => {
        FauxtonAPI.dispatch({
          type: AUTH_CREDS_VALID,
          options: {
            username,
            password
          }
        });
        hidePasswordModal();
        onSuccess(username, password);
      },
      () => {
        FauxtonAPI.addNotification({
          msg: "Your password is incorrect.",
          type: "error",
          clear: true
        });
        FauxtonAPI.dispatch({
          type: AUTH_CREDS_INVALID,
          options: { username: username, password: password }
        });
      }
    );
}

export function updateCreateAdminUsername(value) {
  FauxtonAPI.dispatch({
    type: AUTH_UPDATE_CREATE_ADMIN_USERNAME_FIELD,
    value: value
  });
}

export function updateCreateAdminPassword(value) {
  FauxtonAPI.dispatch({
    type: AUTH_UPDATE_CREATE_ADMIN_PWD_FIELD,
    value: value
  });
}

export function selectPage(page) {
  FauxtonAPI.dispatch({
    type: AUTH_SELECT_PAGE,
    page: page
  });
}

export function showPasswordModal() {
  FauxtonAPI.dispatch({ type: AUTH_SHOW_PASSWORD_MODAL });
}

export function hidePasswordModal() {
  FauxtonAPI.dispatch({ type: AUTH_HIDE_PASSWORD_MODAL });
}
