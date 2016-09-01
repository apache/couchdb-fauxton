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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import { get, post, put, del } from "../../core/ajax";
import CouchdbSession from "../../core/couchdbSession";

var Auth = new FauxtonAPI.addon();


var Admin = Backbone.Model.extend({

  initialize(props, options) {
    this.node = options.node;
  },

  url() {
    if (!this.node) {
      throw new Error('no node set');
    }

    return app.host + '/_node/' + this.node + '/_config/admins/' + this.get('name');
  },

  isNew() { return false; },

  sync(method, model, options) {
    const opts = {
      url: model.url(),
      data: model.get('value'),
    };

    if (method  === 'delete') {
      return del(opts);
    }

    return put(opts);
  }
});

Auth.Session = CouchdbSession.Session.extend({
  url: app.host + '/_session',

  initialize(options) {
    if (!options) { options = {}; }

    _.bindAll(this);

    this.messages = _.extend({},  {
        missingCredentials: 'Username or password cannot be blank.',
        loggedIn: 'You have been logged in.',
        adminCreated: 'CouchDB admin created',
        changePassword: 'Your password has been updated.',
        adminCreationFailedPrefix: 'Could not create admin.'
      }, options.messages);
  },

  isAdminParty() {
    var userCtx = this.get('userCtx');


    if (!userCtx.name && userCtx.roles.indexOf("_admin") > -1) {
      return true;
    }

    return false;
  },

  isLoggedIn() {
    var userCtx = this.get('userCtx');

    if (!userCtx) { return false;}
    if (userCtx.name) {
      return true;
    }

    return false;
  },

  userRoles() {
    var user = this.user();

    if (user && user.roles) {
      if (user.roles.indexOf('fx_loggedIn') === -1) {
        user.roles.push('fx_loggedIn');
      }

      return user.roles;
    }

    return [];
  },

  matchesRoles(roles) {
    if (roles.length === 0) {
      return true;
    }

    var numberMatchingRoles = _.intersection(this.userRoles(), roles).length;

    if (numberMatchingRoles > 0) {
      return true;
    }

    return false;
  },

  validateUser(username, password, msg) {
    if (_.isEmpty(username) || _.isEmpty(password)) {
      var deferred = FauxtonAPI.Deferred();

      deferred.rejectWith(this, [msg]);
      return deferred;
    }
  },

  validatePasswords(password, password_confirm, msg) {
    if (_.isEmpty(password) || _.isEmpty(password_confirm) || (password !== password_confirm)) {
      var deferred = FauxtonAPI.Deferred();

      deferred.rejectWith(this, [msg]);
      return deferred;
    }
  },

  createAdmin(username, password, login, node) {
    var errorPromise = this.validateUser(username, password, this.messages.missingCredentials);

    if (errorPromise) { return errorPromise; }

    var admin = new Admin({
      name: username,
      value: password
    }, {node: node});

    return admin.save().then(function () {
      if (login) {
        return this.login(username, password);
      }

      return this.fetchUser({forceFetch: true});

    }.bind(this));
  },

  login(username, password) {
    var errorPromise = this.validateUser(username, password, this.messages.missingCredentials);

    if (errorPromise) { return errorPromise; }

    return post({
      cache: false,
      url: app.host + "/_session",
      data: {name: username, password: password}
    }).then(() => {
      return this.fetchUser({forceFetch: true});
    });
  },

  logout() {
    return del({
      url: app.host + "/_session",
      dataType: "json",
    }).then(() => {
      return this.fetchUser({forceFetch: true });
    });
  },

  changePassword(password, confirmedPassword, node) {
    var errorMessage = 'Passwords do not match.';
    var errorPromise = this.validatePasswords(password, confirmedPassword, errorMessage);

    if (errorPromise) { return errorPromise; }

    var userName = this.get('userCtx').name;
    var admin = new Admin({
      name: userName,
      value: password
    }, {node: node});

    return admin.save().then(function () {
      return this.login(userName, password);
    }.bind(this));
  }
});


export default Auth;
