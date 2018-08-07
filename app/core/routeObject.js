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

import ReactDOM from "react-dom";
import Backbone from "backbone";
import _ from "lodash";

var RouteObject = function (options) {
  this._options = options;
  this.reactComponents = {};

  this._configure(options || {});
  this.initialize.apply(this, arguments);
};

/* How Route Object events work

Its now very simple. We don't want it to do much. It creates a list of routes. Then each route callback must return
a React component that will be rendered into the app

*/

// Piggy-back on Backbone's self-propagating extend function
RouteObject.extend = Backbone.Model.extend;

var routeObjectOptions = ["routes", "roles"];

_.extend(RouteObject.prototype, {
  // Should these be default vals or empty funcs?
  routes: {},
  route: function () {},
  roles: [],
  initialize: function () {}
}, {

  get: function (key) {
    return _.isFunction(this[key]) ? this[key]() : this[key];
  },

  _configure: function (options) {
    _.each(_.intersection(_.keys(options), routeObjectOptions), (key) => {
      this[key] = options[key];
    });
  },

  getRouteUrls: function () {
    return _.keys(this.get('routes'));
  },

  hasRoute: function (route) {
    if (this.get('routes')[route]) {
      return true;
    }
    return false;
  },

  routeCallback: function (route, args) {
    var routes = this.get('routes'),
        routeObj = routes[route],
        routeCallback;

    if (typeof routeObj === 'object') {
      routeCallback = this[routeObj.route];
    } else {
      routeCallback = this[routeObj];
    }

    return routeCallback.apply(this, args);
  },

  getRouteRoles: function (routeUrl) {
    var route = this.get('routes')[routeUrl];

    if ((typeof route === 'object') && route.roles) {
      return route.roles;
    }

    return this.roles;
  }

});
export default RouteObject;
