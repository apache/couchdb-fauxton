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

import FauxtonAPI from "./base";
import Router from "./router";
import RouteObject from "./routeObject";
import utils from "./utils";
import Store from "./store";
import constants from "../constants";
import dispatcher from "./dispatcher";
import $ from "jquery";
import Backbone from "backbone";
import _ from "lodash";
import Promise from "bluebird";

Backbone.$ = $;
Backbone.ajax = function () {
  return Backbone.$.ajax.apply(Backbone.$, arguments);
};

Object.assign(FauxtonAPI, {
  Router,
  RouteObject,
  utils,
  Store,
  dispatcher,
  Promise,
  Events: _.extend({}, Backbone.Events)
});

// Pass along all constants
FauxtonAPI.constants = constants;

FauxtonAPI.dispatch = dispatcher.dispatch;

FauxtonAPI.navigate = function (url, _opts) {
  var options = _.extend({trigger: true}, _opts);
  FauxtonAPI.router.navigate(url, options);
  if (options.trigger) {
    FauxtonAPI.router.trigger('trigger-update');
  }
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

var urlPaths = {};

FauxtonAPI.registerUrls = function (namespace, urls) {
  urlPaths[namespace] = urls;
};

FauxtonAPI.url = {
  encode(name = "") {
    // These special caracters are allowed by couch: _, $, (, ), +, -, and /
    // From them only $ + and / are to be escaped in a URI component.
    return (/[$+/]/g.test(name)) ? encodeURIComponent(name) : name;
  },
  decode(name = "") {
    return (/[$+/]/g.test(name)) ? decodeURIComponent(name) : name;
  }
};

//This is a little rough and needs some improvement. But the basic concept is there
FauxtonAPI.urls = function (name, context) {
  var interceptors = FauxtonAPI.getExtensions('urls:interceptors');
  var url;

  var args = arguments;
  _.find(interceptors, function (interceptor) {
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

// out-the-box Fauxton has only Views, but scripts extending Fauxton may introduce others (search indexes, geospatial
// indexes, etc). This returns an array of the special design doc property names for the index types
FauxtonAPI.getIndexTypePropNames = function () {
  var indexTypes = FauxtonAPI.getExtensions('IndexTypes:propNames');
  indexTypes.push('views');
  return indexTypes;
};

export default FauxtonAPI;
