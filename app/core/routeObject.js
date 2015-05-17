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
  'core/base',
  'react',
  'backbone'
],
function (FauxtonAPI, React, Backbone) {

  var RouteObject = function (options) {
    this._options = options;
    this.reactComponents = {};

    this._configure(options || {});
    this.initialize.apply(this, arguments);
    this.addEvents();
  };

  var broadcaster = {};
  _.extend(broadcaster, Backbone.Events);

  RouteObject.on = function (eventName, fn) {
    broadcaster.on(eventName, fn);
  };

  /* How Route Object events work
   To listen to a specific route objects events:

   myRouteObject = FauxtonAPI.RouteObject.extend({
    events: {
      "beforeRender": "beforeRenderEvent"
    },

    beforeRenderEvent: function (view, selector) {
      console.log('Hey, beforeRenderEvent triggered',arguments);
    },
   });

    It is also possible to listen to events triggered from all Routeobjects.
    This is great for more general things like adding loaders, hooks.

    FauxtonAPI.RouteObject.on('beforeRender', function (routeObject, view, selector) {
      console.log('hey, this will trigger when any routeobject renders a view');
    });

   Current Events to subscribe to:
    * beforeFullRender -- before a full render is being done
    * beforeEstablish -- before the routeobject calls establish
    * AfterEstablish -- after the routeobject has run establish
    * beforeRender -- before a view is rendered
    * afterRender -- a view is finished being rendered
    * renderComplete -- all rendering is complete

  */

  // Piggy-back on Backbone's self-propagating extend function
  RouteObject.extend = Backbone.Model.extend;

  var routeObjectOptions = ["views", "routes", "events", "roles", "crumbs", "layout", "apiUrl", "establish"];

  _.extend(RouteObject.prototype, Backbone.Events, {
    // Should these be default vals or empty funcs?
    views: {},
    routes: {},
    events: {},
    crumbs: [],
    layout: "with_sidebar",
    apiUrl: null,
    disableLoader: false,
    loaderClassname: 'loader',
    renderedState: false,
    establish: function () {},
    route: function () {},
    roles: [],
    _promises: [],
    initialize: function () {}
  }, {

    renderWith: function (route, masterLayout, args) {

      // set the options for this render
      var options = {
        masterLayout: masterLayout,
        route: route,
        args: args
      };

      var promiseLayout = this.setTemplateOnFullRender(masterLayout);

      this.triggerBroadcast('beforeEstablish');

      var renderAllViews = _.bind(this.renderAllViews, this, options),
          establishError = _.bind(this.establishError, this),
          renderComplete = _.bind(this.renderComplete, this),
          callEstablish = _.bind(this.callEstablish, this),
          renderReactComponents = _.bind(this.renderReactComponents, this),
          promise = this.establish();

      // Only start the view rendering process once the template has been rendered
      // otherwise we get double renders
      promiseLayout.then(function () {
        renderReactComponents();
        callEstablish(promise)
          .then(renderAllViews, establishError)
          .then(renderComplete);
      });
    },

    setTemplateOnFullRender: function (masterLayout) {

      var promise = $.Deferred();

      // Only want to redo the template if its a full render
      if (!this.renderedState) {
        this.triggerBroadcast('beforeFullRender');
        masterLayout.setTemplate(this.layout).then(promise.resolve, promise.reject);
      } else {
        promise.resolve();
      }

      return promise;
    },

    renderReactComponents: function () {
      _.each(this.reactComponents, function (componentInfo, selector) {
        React.render(React.createElement(componentInfo.component, componentInfo.props), $(selector)[0]);
      });
    },

    callEstablish: function (establishPromise) {
      this.addPromise(establishPromise);
      return FauxtonAPI.when(establishPromise);
    },

    renderAllViews: function (options, resp) {
      var routeObject = this,
          renderView = _.bind(this.renderView, this, routeObject, options);

      this.triggerBroadcast('afterEstablish');

      var promises = _.map(routeObject.getViews(), renderView, this);
      return FauxtonAPI.when(promises);
    },

    renderView: function (routeObject, options, view, selector) {
      var viewInfo = {
        view: view,
        selector: selector,
        masterLayout: options.masterLayout
      };

      var renderViewOnLayout = _.bind(this.renderViewOnLayout, this, viewInfo);

      if (view.hasRendered) {
        this.triggerBroadcast('viewHasRendered', view, selector);
        return;
      }

      this.triggerBroadcast('beforeRender', view, selector);

      return this.callEstablish(view.establish()).then(renderViewOnLayout, this.establishError);
    },

    renderViewOnLayout: function (viewInfo, resp, xhr) {
      var masterLayout = viewInfo.masterLayout,
          triggerBroadcast = _.bind(this.triggerBroadcast, this);

      masterLayout.setView(viewInfo.selector, viewInfo.view);
      var promise = masterLayout.renderView(viewInfo.selector).promise();

      promise.then(function () {
        triggerBroadcast('afterRender', viewInfo.view, viewInfo.selector);
      });

      return promise;
    },

    establishError: function (resp) {
      if (!resp || !resp.responseText) { return; }
      FauxtonAPI.addNotification({
            msg: 'An Error occurred: ' + JSON.parse(resp.responseText).reason,
            type: 'error',
            clear: true
      });
    },

    renderComplete: function () {
      // Track that we've done a full initial render
      this.setRenderedState(true);
      this.triggerBroadcast('renderComplete');
    },

    setRenderedState: function (bool) {
      this.renderedState = bool;
    },

    triggerBroadcast: function (eventName) {
      var args = Array.prototype.slice.call(arguments);
      this.trigger.apply(this, args);

      args.splice(0, 1, eventName, this);
      broadcaster.trigger.apply(broadcaster, args);
    },

    get: function (key) {
      return _.isFunction(this[key]) ? this[key]() : this[key];
    },

    addEvents: function (events) {
      events = events || this.get('events');
      _.each(events, function (method, event) {
        if (!_.isFunction(method) && !_.isFunction (this[method])) {
          throw new Error("Invalid method: " + method);
        }
        method = _.isFunction(method) ? method : this[method];

        this.on(event, method);
      }, this);
    },

    _configure: function (options) {
      _.each(_.intersection(_.keys(options), routeObjectOptions), function (key) {
        this[key] = options[key];
      }, this);
    },

    getView: function (selector) {
      return this.views[selector];
    },

    setView: function (selector, view) {
      this.removeView(selector);
      this.removeComponent(selector);
      this.views[selector] = view;
      return view;
    },

    setComponent: function (selector, component, props) {
      this.removeView(selector);
      this.removeComponent(selector);
      this.reactComponents[selector] = {
        component: component,
        props: props || null
      };
    },

    removeComponent: function (selector) {
      if (_.has(this.reactComponents, selector)) {
        React.unmountComponentAtNode($(selector)[0]);
        this.reactComponents[selector] = null;
        delete this.reactComponents[selector];
      }
    },

    removeComponents: function () {
      _.each(this.reactComponents, function (component, selector) {
        this.removeComponent(selector);
      }, this);

      this.reactComponents = {};
    },

    getViews: function () {
      return this.views;
    },

    removeView: function (selector) {
      if (_.has(this.views, selector)) {
        this.views[selector].remove();
        this.views[selector] = null;
        delete this.views[selector];
      }
    },

    removeViews: function () {
      _.each(this.views, function (view, selector) {
        view.remove();
        delete this.views[selector];
        view = null;
      }, this);
    },

    addPromise: function (promise) {
      if (_.isEmpty(promise)) { return; }

      if (!_.isArray(promise)) {
        return this._promises.push(promise);
      }

      _.each(promise, function (p) {
        this._promises.push(p);
      }, this);
    },

    cleanup: function () {
      this.removeComponents();
      this.removeViews();
      this.rejectPromises();
    },

    rejectPromises: function () {
      _.each(this._promises, function (promise) {
        if (promise.state() === "resolved") { return; }
        if (promise.abort) {
          return promise.abort("Route change");
        }

        promise.reject && promise.reject();
      }, this);

      this._promises = [];
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

      routeCallback.apply(this, args);
    },

    getRouteRoles: function (routeUrl) {
      var route = this.get('routes')[routeUrl];

      if ((typeof route === 'object') && route.roles) {
        return route.roles;
      }

      return this.roles;
    }

  });
  return RouteObject;
});
