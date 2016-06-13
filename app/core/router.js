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

import FauxtonAPI from "./base";
import Auth from "./auth";
import Backbone from "backbone";

var beforeUnloads = {};

export default Backbone.Router.extend({
  routes: {},

  beforeUnload: function (name, fn) {
    beforeUnloads[name] = fn;
  },

  removeBeforeUnload: function (name) {
    delete beforeUnloads[name];
  },


  navigate: function (fragment, options) {
    let continueNav = true;
    const msg = _.find(_.map(beforeUnloads, function (fn) { return fn(); }), function (beforeReturn) {
      if (beforeReturn) { return true; }
    });

    if (msg) {
      continueNav = window.confirm(msg);
    }

    if (options && options.redirect) {
      return window.location = fragment;
    }

    if (continueNav) {
      Backbone.Router.prototype.navigate(fragment, options);
    }
  },

  addModuleRouteObject: function (RouteObject) {
    var that = this;
    var masterLayout = FauxtonAPI.masterLayout,
    routeUrls = RouteObject.prototype.getRouteUrls();

    _.each(routeUrls, function (route) {
      this.route(route, route.toString(), function () {
        var args = Array.prototype.slice.call(arguments),
        roles = RouteObject.prototype.getRouteRoles(route),
        authPromise = FauxtonAPI.auth.checkAccess(roles);

        authPromise.then(function () {
          if (!that.activeRouteObject || !that.activeRouteObject.hasRoute(route)) {
            that.activeRouteObject && that.activeRouteObject.cleanup();
            that.activeRouteObject = new RouteObject(route, masterLayout, args);
          }

          var routeObject = that.activeRouteObject;
          routeObject.rejectPromises();
          routeObject.routeCallback(route, args);
          routeObject.renderWith(route, masterLayout, args);
        }, function () {
          FauxtonAPI.auth.authDeniedCb();
        });

      });
    }, this);
  },

  setModuleRoutes: function (addons) {
    _.each(addons, function (module) {
      if (module) {
        module.initialize();
        // This is pure routes the addon provides
        if (module.RouteObjects) {
          _.each(module.RouteObjects, this.addModuleRouteObject, this);
        }
      }
    }, this);
  },

  initialize: function (addons) {
    this.addons = addons;
    this.auth = FauxtonAPI.auth = new Auth();
    // NOTE: This must be below creation of the layout
    // FauxtonAPI header links and others depend on existence of the layout
    this.setModuleRoutes(addons);

    $(FauxtonAPI.el).append(FauxtonAPI.masterLayout.el);
    FauxtonAPI.masterLayout.render();

    this.lastPages = [];
    //keep last pages visited in Fauxton
    Backbone.history.on('route', function () {
      this.lastPages.push(Backbone.history.fragment);
      if (this.lastPages.length > 2) {
        this.lastPages.shift();
      }
    }, this);
  },

  triggerRouteEvent: function (event, args) {
    if (this.activeRouteObject) {
      var eventArgs = [event].concat(args);

      this.activeRouteObject.trigger.apply(this.activeRouteObject, eventArgs);
      this.activeRouteObject.renderWith(eventArgs, FauxtonAPI.masterLayout, args);
    }
  }
});
