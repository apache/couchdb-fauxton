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
import { json, login } from "./http";
import { each, uniqueId } from 'lodash';
import app from '../app';
import * as authMessages from './constants/auth_messages';

function isAdmin(roles = []) {
  return roles.includes("_admin");
}

export default class {
  constructor() {
    this._user = {
      roles: []
    };
    this.messages = authMessages;
    this._onChange = {};
  }
  getUserFromSession() {
    return json("/_session").then(({ userCtx }) => userCtx);
  }
  set user(user) {
    if (this._user.name !== user.name) {
      this._user = {
        name: user.name,
        roles: user.roles,
        isAdmin: isAdmin(user.roles)
      };
      each(this._onChange, (fn) => fn(this._user));
    }
    return this._user;
  }
  get user() {
    return this._user;
  }
  fetchUser() {
    return this
      .getUserFromSession()
      .then(userCtx => {
        this.user = userCtx;
      });
  }
  isAdminParty() {
    return (!this.user.name && this.user.isAdmin);
  }
  isLoggedIn() {
    debugger;
    return !!this.user.name;
  }
  userRoles() {
    var user = this.user;

    if (user && user.roles) {
      if (user.roles.indexOf("fx_loggedIn") === -1) {
        user.roles.push("fx_loggedIn");
      }

      return user.roles;
    }

    return [];
  }
  onChange(fn) {
    let uuid = uniqueId();
    this._onChange[uuid] = fn;
    return () => {
      delete this._onChange[uuid];
    }
  }
  matchesRoles(roles) {
    if (roles.length === 0) {
      return true;
    }

    var numberMatchingRoles = _.intersection(this.userRoles(), roles).length;

    if (numberMatchingRoles > 0) {
      return true;
    }

    return false;
  }
  validateUser(username, password, msg) {
    return new Promise((resolve, reject) => (_.isEmpty(username) || _.isEmpty(password))
    ? reject(msg)
    : resolve()
    );
  }
  validatePasswords(password, password_confirm, msg) {
    return new Promise((resolve, reject) => (_.isEmpty(password) ||
        _.isEmpty(password_confirm) ||
        password !== password_confirm
    )
    ? reject(msg)
    : resolve());
  }
  createAdmin(username, password, login, node) {
    var errorPromise = this.validateUser(
      username,
      password,
      this.messages.missingCredentials
    );

    if (errorPromise) {
      return errorPromise;
    }

    var admin = new Admin(
      {
        name: username,
        value: password
      },
      { node: node }
    );

    return admin.save().then(
      (function() {
        if (login) {
          return this.login(username, password);
        }

        return this.fetchUser({ forceFetch: true });
      }).bind(this)
    );
  }
  login(username, password) {
    return this.validateUser(
      username,
      password,
      this.messages.missingCredentials
    )
    .then(() => login({ name: username, password: password }))
    .then(() => this.fetchUser({ forceFetch: true }));
  }
  logout() {
    var that = this;

    return $.ajax({
      type: "DELETE",
      url: app.host + "/_session",
      dataType: "json",
      username: "_",
      password: "_"
    }).then(function() {
      return that.fetchUser({ forceFetch: true });
    });
  }
  changePassword(password, confirmedPassword, node) {
    var errorMessage = "Passwords do not match.";
    var errorPromise = this.validatePasswords(
      password,
      confirmedPassword,
      errorMessage
    );

    if (errorPromise) {
      return errorPromise;
    }

    var userName = this.get("userCtx").name;
    var admin = new Admin(
      {
        name: userName,
        value: password
      },
      { node: node }
    );

    return admin.save().then(
      (function() {
        return this.login(userName, password);
      }).bind(this)
    );
  }
}
