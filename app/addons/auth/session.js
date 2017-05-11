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

import { uniqueId, each, includes } from "lodash";
import Api from './api';
import Promise from 'bluebird';

function isAdmin(roles = []) {
  return includes(roles, "_admin");
}

export default class {

  constructor(opts) {
    this._user = {
      name: false,
      roles: []
    };
    this._onChange = {};
    this._authenticatedPromise = new Promise((resolve, reject) => {
      this._authenticateResolve = resolve;
      this._authenticateReject = reject;
    });

    this._allowAdminParty = opts.allowAdminParty;
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

  getSession() {
    return Api.getSession()
      .then(userCtx => {
        this.setUser(userCtx);
        if (this.isLoggedIn()) {
          this._authenticateResolve(this.user());
        }
      })
      .catch(err => {
        this._authenticateReject(err);
      });
  }

  isAdminParty() {
    if (!this._allowAdminParty) {
      return false;
    }

    return !this._user.name && this._user.isAdmin;
  }

  isLoggedIn() {
    return !_.isNull(this._user.name);
  }

  userRoles() {
    const user = this._user;

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
    if (roles.length === 0) {
      return true;
    }

    const numberMatchingRoles = _.intersection(this.userRoles(), roles).length;
    return numberMatchingRoles > 0;
  }
}
