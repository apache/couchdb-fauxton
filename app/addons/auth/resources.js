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
    }
  });


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

  Auth.LoginView = FauxtonAPI.View.extend({
    template: 'addons/auth/templates/login',
    className: "row-fluid",
    initialize: function (options) {
      this.urlBack = options.urlBack || "";
    },

    events: {
      "submit #login": "login"
    },

    login: function (event) {
      event.preventDefault();

      var username = this.$('#username').val(),
          password = this.$('#password').val(),
          urlBack = this.urlBack,
          promise = this.model.login(username, password);

      promise.then(function () {
        FauxtonAPI.addNotification({msg:  FauxtonAPI.session.messages.loggedIn });

        if (urlBack) {
          return FauxtonAPI.navigate(urlBack);
        }

        FauxtonAPI.navigate('/');
      });

      promise.fail(errorHandler);
    },

    afterRender: function () {
      $("#username").focus();
    }
  });
  return Auth;
});
