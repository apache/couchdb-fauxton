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
  'api',
  'addons/auth/resources'

],

function (app, FauxtonAPI, Auth) {

  var Config = FauxtonAPI.addon();


  Config.Model = Backbone.Model.extend({});
  Config.OptionModel = Backbone.Model.extend({
    documentation: FauxtonAPI.constants.DOC_URLS.CONFIG,

    url: function () {
      return app.host + '/_config/' + this.get("section") + '/' + encodeURIComponent(this.get("name"));
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

  Config.Collection = Backbone.Collection.extend({
    model: Config.Model,

    documentation: FauxtonAPI.constants.DOC_URLS.CONFIG,

    comparator: function (OptionModel) {
      if (OptionModel.get("section")) {
        return OptionModel.get("section");
      }
    },

    url: function () {
      return window.location.origin + '/_config';
    },

    findEntryInSection: function (sectionName, entry) {
      var section = _.findWhere(this.toJSON(), {"section": sectionName}),
          options;

      if (!section) {
        return false;
      }

      options = _.findWhere(section.options, {name: entry});

      return options;
    },

    parse: function (resp) {
      return _.map(resp, function (section, section_name) {
        return {
          section: section_name,
          options: _.map(section, function (option, option_name) {
            return {
              name: option_name,
              value: option
            };
          })
        };
      });
    }
  });

  // -- user config

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

  Config.UserManagment = Auth.Session.extend({

    validatePasswords: function (password, passwordConfirm, msg) {
      if (_.isEmpty(password) || _.isEmpty(passwordConfirm) || (password !== passwordConfirm)) {
        var deferred = FauxtonAPI.Deferred();

        deferred.rejectWith(this, [msg]);
        return deferred;
      }
    },

    createAdmin: function (username, password, login) {
      var errorPromise = this.validateUser(username, password, this.messages.missingCredentials);

      if (errorPromise) { return errorPromise; }

      var admin = new Admin({
        name: username,
        value: password
      });

      return admin.save().then(function () {
        if (login) {
          return this.login(username, password);
        } else {
          return this.fetchUser({forceFetch: true});
        }
      }.bind(this));
    },

    changePassword: function (password, passwordConfirm) {
      var errorPromise = this.validatePasswords(password, passwordConfirm, this.messages.passwordsNotMatch);

      if (errorPromise) { return errorPromise; }

      var info = app.session.get('info'),
          userCtx = FauxtonAPI.session.get('userCtx');

      var admin = new Admin({
        name: userCtx.name,
        value: password
      });

      return admin.save().then(function () {
        return this.login(userCtx.name, password);
      }.bind(this));
    }

  });
  return Config;
});
