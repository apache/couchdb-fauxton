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

import Backbone from "backbone";
import _ from "lodash";

var FauxtonAPI = {
  //add default objects
  router: {
    navigate: function () {}
  },

  masterLayout: {},

  // I haven't wrapped these dispatch methods in a action
  // because I don't want to require fauxton/actions in this method.
  addHeaderLink: function (link) {
    FauxtonAPI.reduxDispatch({
      type: 'ADD_NAVBAR_LINK',
      link: link
    });
  },
  showHeaderLinkBadge: function (link) {
    FauxtonAPI.reduxDispatch({
      type: 'SHOW_NAVBAR_LINK_BADGE',
      link: link
    });
  },
  hideHeaderLinkBadge: function (link) {
    FauxtonAPI.reduxDispatch({
      type: 'HIDE_NAVBAR_LINK_BADGE',
      link: link
    });
  },

  /**
   * Displays a notification message. The message is only displayed for a few seconds.
   * The option visibleTime can be provided to set for how long the message should be displayed.
   *
   * @param {object} options Options are of the form
   * {
   *  message: "string",
   *  type: "success"|"error"|"info",
   *  clear: true|false,
   *  escape: true|false,
   *  visibleTime: number
   * }
   */
  addNotification: function (options) {
    options = Object.assign({
      msg: 'Notification Event Triggered!',
      type: 'info',
      escape: true,
      clear: false
    }, options);

    if (FauxtonAPI.reduxDispatch) {
      FauxtonAPI.reduxDispatch({
        type: 'ADD_NOTIFICATION',
        options: {
          info: options
        }
      });
    }
  },

  /**
   * Shows a permanent notification message
   *
   * @param {object} message
   */
  showPermanentNotification: function (message) {
    FauxtonAPI.reduxDispatch({
      type: 'SHOW_PERMANENT_NOTIFICATION',
      options: { msg: message }
    });
  },

  config: function (options) {
    return _.extend(this, options);
  }
};

FauxtonAPI.Deferred = function () {
  return $.Deferred();
};

FauxtonAPI.when = function (deferreds) {
  if (deferreds instanceof Array) {
    return $.when.apply(null, deferreds);
  }

  return $.when(deferreds);
};

FauxtonAPI.addonExtensions = {
  initialize: function () {},
  RouteObjects: {},
  Views: {}
};

FauxtonAPI.addon = function (extra) {
  return _.extend(_.clone(FauxtonAPI.addonExtensions), extra);
};

FauxtonAPI.View = Backbone.View.extend({
  // This should return an array of promises, an empty array, or null
  establish: function () {
    return null;
  },
  loaderClassname: 'loader',
  manage: true,

  forceRender: function () {
    this.hasRendered = false;
  }
});

var caching = {
  fetchOnce: function (opt) {
    var options = _.extend({}, opt);

    if (!this._deferred || this._deferred.state() === "rejected" || options.forceFetch) {
      this._deferred = this.fetch();
    }

    return this._deferred;
  }
};

FauxtonAPI.Model = Backbone.Model.extend({ });

FauxtonAPI.Collection = Backbone.Collection.extend({ });

_.each([FauxtonAPI.Model, FauxtonAPI.Collection], function (ctor) {
  _.extend(ctor.prototype, caching);
});

var extensions = _.extend({}, Backbone.Events);
// Can look at a remove function later.
FauxtonAPI.registerExtension = function (name, view) {
  if (!extensions[name]) {
    extensions[name] = [];
  }

  extensions.trigger('add:' + name, view);
  extensions[name].push(view);
};

FauxtonAPI.unRegisterExtension = function (name) {
  var views = extensions[name];

  if (!views) { return; }
  extensions.trigger('remove:' + name, views);
  delete extensions[name];
};

FauxtonAPI.getExtensions = function (name) {
  var views = extensions[name];

  if (!views) {
    views = [];
  }
  return views;
};

FauxtonAPI.removeExtensionItem = function (name, view, cb) {
  var views = extensions[name];
  if (!views) { return; }

  var _cb = arguments[arguments.length - 1];
  if (_.isObject(view) && !cb) {
    _cb = function (item) { return _.isEqual(item, view);};
  }

  views = _.filter(views, function (item) {
    return !_cb(item);
  });

  extensions[name] = views;
  extensions.trigger('removeItem:' + name, view);
};

FauxtonAPI.extensions = extensions;

FauxtonAPI.setSession = function (newSession) {
  FauxtonAPI.session = newSession;
};

FauxtonAPI.reducers = {};


FauxtonAPI.addReducers = (reducers) => {
  FauxtonAPI.reducers = {
    ...FauxtonAPI.reducers,
    ...reducers
  };
};

FauxtonAPI.middlewares = [];
FauxtonAPI.addMiddleware = (middleware) => {
  // Basic validation
  if (middleware && typeof middleware === 'function') {
    FauxtonAPI.middlewares.push(middleware);
  }
};

export default FauxtonAPI;
