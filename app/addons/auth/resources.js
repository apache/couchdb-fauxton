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
  '../../app',
  '../../core/api',
  "../../core/couchdbSession"
],

function (app, FauxtonAPI, CouchdbSession) {

  var Auth = new FauxtonAPI.addon();


  var Admin = Backbone.Model.extend({

    initialize: function (props, options) {
      this.node = options.node;
    },

    url: function () {
      if (!this.node) {
        throw new Error('no node set');
      }

      return app.host + '/_node/' + this.node + '/_config/admins/' + this.get('name');
    },

    isNew: function () { return false; },

    sync: function (method, model, options) {
      var params = {
        url: model.url(),
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(model.get('value'))
      };

      if (method === 'delete') {
        params.type = 'DELETE';
      } else {
        params.type = 'PUT';
      }

      return $.ajax(params);
    }
  });

  Auth.Session = CouchdbSession.Session.extend({
    url: app.host + '/_session',

    initialize: function (options) {
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

    isAdminParty: function () {
      var userCtx = this.get('userCtx');


      if (!userCtx.name && userCtx.roles.indexOf("_admin") > -1) {
        return true;
      }

      return false;
    },

    isLoggedIn: function () {
      var userCtx = this.get('userCtx');

      if (!userCtx) { return false;}
      if (userCtx.name) {
        return true;
      }

      return false;
    },

    userRoles: function () {
      var user = this.user();

      if (user && user.roles) {
        if (user.roles.indexOf('fx_loggedIn') === -1) {
          user.roles.push('fx_loggedIn');
        }

        return user.roles;
      }

      return [];
    },

    matchesRoles: function (roles) {
      if (roles.length === 0) {
        return true;
      }

      var numberMatchingRoles = _.intersection(this.userRoles(), roles).length;

      if (numberMatchingRoles > 0) {
        return true;
      }

      return false;
    },

    validateUser: function (username, password, msg) {
      if (_.isEmpty(username) || _.isEmpty(password)) {
        var deferred = FauxtonAPI.Deferred();

        deferred.rejectWith(this, [msg]);
        return deferred;
      }
    },

    validatePasswords: function (password, password_confirm, msg) {
      if (_.isEmpty(password) || _.isEmpty(password_confirm) || (password !== password_confirm)) {
        var deferred = FauxtonAPI.Deferred();

        deferred.rejectWith(this, [msg]);
        return deferred;
      }
    },

    createAdmin: function (username, password, login, node) {
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

    login: function (username, password) {
      var errorPromise = this.validateUser(username, password, this.messages.missingCredentials);

      if (errorPromise) { return errorPromise; }

      return $.ajax({
        cache: false,
        type: "POST",
        url: app.host + "/_session",
        dataType: "json",
        data: {name: username, password: password}
      }).then(function () {
        return this.fetchUser({forceFetch: true});
      }.bind(this));
    },

    logout: function () {
      var that = this;

      return $.ajax({
        type: "DELETE",
        url: app.host + "/_session",
        dataType: "json",
        username : "_",
        password : "_"
      }).then(function () {
        return that.fetchUser({forceFetch: true });
      });
    },

    changePassword: function (password, confirmedPassword, node) {
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


  return Auth;
});
