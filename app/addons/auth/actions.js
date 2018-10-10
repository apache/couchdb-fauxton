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
import app from "../../app";
import ActionTypes from './actiontypes';
import Api from './api';

const {
  AUTH_HIDE_PASSWORD_MODAL,
} = ActionTypes;

const errorHandler = ({ message }) => {
  FauxtonAPI.addNotification({
    msg: message,
    type: "error"
  });
};

const validate = (...predicates) => {
  return predicates.every(isTrue => isTrue);
};

export const validateUser = (username, password) => {
  return validate(!_.isEmpty(username), !_.isEmpty(password));
};

export const validatePasswords = (password, passwordConfirm) => {
  return validate(
    !_.isEmpty(password),
    !_.isEmpty(passwordConfirm),
    password === passwordConfirm
  );
};

export const login = (username, password, urlBack) => {
  if (!validateUser(username, password)) {
    return errorHandler({message: app.i18n.en_US['auth-missing-credentials']});
  }

  return Api.login({name: username, password})
    .then(resp => {
      if (resp.error) {
        errorHandler({message: resp.reason});
        return resp;
      }

      let msg = app.i18n.en_US['auth-logged-in'];
      if (msg) {
        FauxtonAPI.addNotification({msg});
      }

      if (urlBack && !urlBack.includes("login")) {
        return FauxtonAPI.navigate(urlBack);
      }
      FauxtonAPI.navigate("/");
    })
    .catch(errorHandler);
};

export const changePassword = (username, password, passwordConfirm, nodes) => () => {
  if (!validatePasswords(password, passwordConfirm)) {
    return errorHandler({message: app.i18n.en_US['auth-passwords-not-matching']});
  }
  //To change an admin's password is the same as creating an admin. So we just use the
  //same api function call here.
  Api.createAdmin({
    name: username,
    password,
    node: nodes[0].node
  }).then(
    () => {
      FauxtonAPI.addNotification({
        msg: app.i18n.en_US["auth-change-password"]
      });
    },
    errorHandler
  );
};

export const createAdmin = (username, password, loginAfter, nodes) => () => {
  const node = nodes[0].node;
  if (!validateUser(username, password)) {
    return errorHandler({message: app.i18n.en_US['auth-missing-credentials']});
  }

  Api.createAdmin({name: username, password, node})
    .then(resp => {
      if (resp.error) {
        return errorHandler({message: `${app.i18n.en_US['auth-admin-creation-failed-prefix']} ${resp.reason}`});
      }

      FauxtonAPI.addNotification({
        msg: app.i18n.en_US['auth-admin-created']
      });

      if (loginAfter) {
        return FauxtonAPI.navigate("/login");
      }
    });
};

// simple authentication method - does nothing other than check creds
export const authenticate = (username, password, onSuccess) => {
  Api.login({
    name: username,
    password: password
  })
    .then((resp) => {
      if (resp.error) {
        throw (resp);
      }
      hidePasswordModal();
      onSuccess(username, password);
    })
    .catch(() => {
      FauxtonAPI.addNotification({
        msg: "Your username or password is incorrect.",
        type: "error",
        clear: true
      });
    });
};

export const hidePasswordModal = () => {
  FauxtonAPI.dispatch({ type: AUTH_HIDE_PASSWORD_MODAL });
};

export const logout = () => {
  FauxtonAPI.addNotification({ msg: "You have been logged out." });
  Api.logout()
    .then(Api.getSession)
    .then(() => FauxtonAPI.navigate('/'))
    .catch(errorHandler);
};
