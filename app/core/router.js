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

import {checkAccess} from "./authentication";
import Backbone from "backbone";
import _ from "lodash";

var beforeUnloads = {};

export default Backbone.Router.extend({
  routes: {},
  originalPageTitle: window.document.title,

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
      this.updateWindowTitle(fragment);
    }
  },

  updateWindowTitle: function(fragment) {
    if (fragment.startsWith('#/')) {
      window.document.title = this.originalPageTitle + ' - ' + fragment.substring(2);
    } else if (fragment.startsWith('/') || fragment.startsWith('#')) {
      window.document.title = this.originalPageTitle + ' - ' + fragment.substring(1);
    } else {
      window.document.title = this.originalPageTitle + ' - ' + fragment;
    }
  },

  addModuleRouteObject: function (RouteObject) {
    const that = this;
    const routeUrls = RouteObject.prototype.getRouteUrls();

    routeUrls.forEach(route => {
      this.route(route, route.toString(), (...args) => {
        const roles = RouteObject.prototype.getRouteRoles(route);

        checkAccess(roles).then(() => {
          if (!that.activeRouteObject || !that.activeRouteObject.hasRoute(route)) {
            that.activeRouteObject = new RouteObject(route, args);
          }

          const routeObject = that.activeRouteObject;
          const component = routeObject.routeCallback(route, args);
          that.currentRouteOptions = {
            selectedHeader: this.activeRouteObject.selectedHeader,
            component,
            roles,
            route: route.toString()
          };
          that.trigger('new-component', this.currentRouteOptions);
        }, () => {/* do nothing on reject*/ });
      });
    });
  },

  setModuleRoutes: function (addons) {
    _.each(addons, (module) => {
      if (module) {
        module.initialize();
        // This is pure routes the addon provides
        if (module.RouteObjects) {
          _.each(module.RouteObjects, this.addModuleRouteObject.bind(this));
        }
      }
    });
  },

  initialize: function (addons) {
    this.addons = addons;
    // NOTE: This must be below creation of the layout
    // FauxtonAPI header links and others depend on existence of the layout
    this.setModuleRoutes(addons);

    this.lastPages = [];
    //keep last few pages visited in Fauxton
    Backbone.history.on('route', function () {
      this.lastPages.push(Backbone.history.fragment);
      if (this.lastPages.length > 5) {
        this.lastPages.shift();
      }
    }, this);
  }
});
