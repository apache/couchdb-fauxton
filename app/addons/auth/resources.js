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
       "app",
       "api",
       "core/couchdbSession"
],

function (app, FauxtonAPI, CouchdbSession) {

  var Auth = new FauxtonAPI.addon();


  var Admin = Backbone.Model.extend({
    url: function () {
      return app.host + '/_config/admins/' + this.get("name");
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
          passwordsNotMatch:  'Passwords do not match.',
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

    createAdmin: function (username, password, login) {
      var that = this,
          error_promise =  this.validateUser(username, password, this.messages.missingCredentials);

      if (error_promise) { return error_promise; }

      var admin = new Admin({
        name: username,
        value: password
      });

      return admin.save().then(function () {
        if (login) {
          return that.login(username, password);
        } else {
          return that.fetchUser({forceFetch: true});
        }
      });
    },

    login: function (username, password) {
      var error_promise =  this.validateUser(username, password, this.messages.missingCredentials);

      if (error_promise) { return error_promise; }

      var that = this;

      return $.ajax({
        cache: false,
        type: "POST",
        url: app.host + "/_session",
        dataType: "json",
        data: {name: username, password: password}
      }).then(function () {
        return that.fetchUser({forceFetch: true});
      });
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

    changePassword: function (password, password_confirm) {
      var error_promise =  this.validatePasswords(password, password_confirm, this.messages.passwordsNotMatch);

      if (error_promise) { return error_promise; }

      var  that = this,
           info = this.get('info'),
           userCtx = this.get('userCtx');

      var admin = new Admin({
        name: userCtx.name,
        value: password
      });

      return admin.save().then(function () {
        return that.login(userCtx.name, password);
      });
    }
  });


  return Auth;
});
