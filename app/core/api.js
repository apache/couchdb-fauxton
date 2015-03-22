// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

define([
  'core/base',
  'core/layout',
  'core/router',
  'core/routeObject',
  'core/utils',
  'core/store',
  'constants',

  'flux'
],

function (FauxtonAPI, Layout, Router, RouteObject, utils, Store, constants, Flux) {
  FauxtonAPI = _.extend(FauxtonAPI, {
    Layout: Layout,
    Router: Router,
    RouteObject: RouteObject,
    utils: utils,
    Store: Store,
    Events: _.extend({}, Backbone.Events),
    dispatcher: new Flux.Dispatcher()
  });

  // Pass along all constants
  FauxtonAPI.constants = constants;

  FauxtonAPI.dispatch = _.bind(FauxtonAPI.dispatcher.dispatch, FauxtonAPI.dispatcher);

  FauxtonAPI.navigate = function (url, _opts) {
    var options = _.extend({trigger: true}, _opts);
    FauxtonAPI.router.navigate(url, options);
  };

  FauxtonAPI.beforeUnload = function () {
    FauxtonAPI.router.beforeUnload.apply(FauxtonAPI.router, arguments);
  };

  FauxtonAPI.removeBeforeUnload = function () {
    FauxtonAPI.router.removeBeforeUnload.apply(FauxtonAPI.router, arguments);
  };

  FauxtonAPI.addRoute = function (route) {
    FauxtonAPI.router.route(route.route, route.name, route.callback);
  };

  FauxtonAPI.triggerRouteEvent = function (routeEvent, args) {
    FauxtonAPI.router.triggerRouteEvent('route:' + routeEvent, args);
  };

  var urlPaths = {};

  FauxtonAPI.registerUrls = function (namespace, urls) {
    urlPaths[namespace] = urls;
  };

  //This is a little rough and needs some improvement. But the basic concept is there
  FauxtonAPI.urls = function (name, context) {
    var interceptors = FauxtonAPI.getExtensions('urls:interceptors');
    var url;

    var args = arguments;
    _.first(interceptors, function (interceptor) {
      var out = interceptor.apply(null, args);

      if (out) {
        url = out;
        return true;
      }
      return false;
    });

    if (!_.isUndefined(url)) { return url; }

    if (!urlPaths[name]) {
      console.error('could not find name ', name);
      return '';
    }

    if (!urlPaths[name][context]) {
      console.error('could not find context ', context);
      return '';
    }

    args = Array.prototype.slice.call(arguments, 2);
    url = urlPaths[name][context].apply(null, args);
    return url;
  };

  return FauxtonAPI;
});

