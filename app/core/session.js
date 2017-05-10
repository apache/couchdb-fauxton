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
import couchdb from "./couchdb";
import { uniqueId, each } from "lodash";
import Promise from 'Bluebird';

const authMessages = {
  missingCredentials: "Username or password cannot be blank.",
  loggedIn: "You have been logged in.",
  adminCreated: "CouchDB admin created",
  changePassword: "Your password has been updated.",
  adminCreationFailedPrefix: "Could not create admin.",
  passwordsNotMatching: "Passwords do not match."
};

function isAdmin(roles = []) {
  return roles.includes("_admin");
}

function validate(...predicates) {
  return predicates.every(isTrue => isTrue);
}

export default class {

  constructor() {
    this._user = {
      roles: []
    };
    this._onChange = {};
    this.messages = authMessages;
    this._authenticatedPromise = new Promise(resolve => {
      this._authenticateResolve = resolve;
    });
  }
  getUserFromSession() {
    return couchdb.session.get().then(({ userCtx }) => {
      return userCtx;
    });
  }

  isAuthenticated () {
    return this._authenticatedPromise;
  }

  setUser(user) {
    if (this._user.name !== user.name) {
      this._user = {
        name: user.name,
        roles: user.roles,
        isAdmin: isAdmin(user.roles)
      };
      each(this._onChange, fn => fn(this._user));
    }
    return this._user;
  }

  user() {
    return this._user;
  }

  fetchUser() {
    return this.getUserFromSession().then(userCtx => {
      this.setUser(userCtx);
      console.log('HAve user', this.isLoggedIn());
      if (this.isLoggedIn()) {
        this._authenticateResolve(this.user());
      }
    });
  }

  isAdminParty() {
    return !this._user.name && this._user.isAdmin;
  }

  isLoggedIn() {
    return !_.isNull(this._user.name);
  }

  userRoles() {
    const user = this._user;

    console.log('UU', this._user, this.isLoggedIn());
    //if (user && user.roles) {
    if (this.isLoggedIn()) {
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
    };
  }

  matchesRoles(roles = []) {
    const numberMatchingRoles = _.intersection(this.userRoles(), roles).length;
    return numberMatchingRoles > 0;
  }

  validateUser(username, password, msg) {
    const isValid = validate(!_.isEmpty(username), !_.isEmpty(password));
    return isValid ? Promise.resolve() : Promise.reject(msg);
  }

  validatePasswords(password, password_confirm, msg) {
    const isValid = validate(
      _.isEmpty(password),
      _.isEmpty(password_confirm),
      password !== password_confirm
    );
    return isValid ? Promise.resolve() : Promise.reject(msg);
  }

  createAdmin(username, password, login, node) {
    return this
      .validateUser(username, password, this.messages.missingCredentials)
      .then(() => couchdb.admin.create({ name: this._user.name, password, node }))
      .then(
        () =>
          login
            ? this.login(username, password)
            : this.fetchUser({ forceFetch: true })
      );
  }

  login(username, password) {
    return this
      .validateUser(username, password, authMessages.missingCredentials)
      .then(() => couchdb.session.create({ name: username, password: password }))
      .then((res) => {
        if (res.error) throw new Error(res.error);
      })
      .then(() => this.fetchUser());
  }

  logout() {
    return couchdb.session.remove().then(() => this.fetchUser());
  }

  changePassword(password, confirmedPassword, node) {
    return this
      .validatePasswords(
        password,
        confirmedPassword,
        authMessages.passwordsNotMatching
      )
      .then(() => couchdb.admin.create({ name: this._user.name, password, node }))
      .then(() => this.login(this._user.name, password));
  }
}
