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
  "addons/fauxton/components",
  "addons/fauxton/navigation/components.react",
  "addons/fauxton/navigation/actions",
  "plugins/zeroclipboard/ZeroClipboard"
],

function (app, FauxtonAPI, Components, NavbarReactComponents, NavigationActions, ZeroClipboard) {

  var Fauxton = FauxtonAPI.addon();
  FauxtonAPI.addNotification = function (options) {
    options = _.extend({
      msg: "Notification Event Triggered!",
      type: "info",
      selector: "#global-notifications",
      escape: true
    }, options);

    var view = new Fauxton.Notification(options);
    return view.renderNotification();
  };

  FauxtonAPI.UUID = FauxtonAPI.Model.extend({
    initialize: function (options) {
      options = _.extend({count: 1}, options);
      this.count = options.count;
    },

    url: function () {
      return app.host + "/_uuids?count=" + this.count;
    },

    next: function () {
      return this.get("uuids").pop();
    }
  });


  Fauxton.initialize = function () {
    app.apiBar = new Components.ApiBar();

    FauxtonAPI.masterLayout.setView("#api-navbar", app.apiBar, true);
    app.apiBar.render();
    FauxtonAPI.masterLayout.apiBar = app.apiBar;

    FauxtonAPI.RouteObject.on('beforeFullRender', function (routeObject) {
      NavigationActions.setNavbarActiveLink(_.result(routeObject, 'selectedHeader'));
    });

    FauxtonAPI.RouteObject.on('beforeEstablish', function (routeObject) {
      if (routeObject.overrideBreadcrumbs) { return; }

      FauxtonAPI.masterLayout.removeView('#breadcrumbs');
      var crumbs = routeObject.get('crumbs');

      if (crumbs.length) {
        FauxtonAPI.masterLayout.setView('#breadcrumbs', new Components.Breadcrumbs({
          crumbs: crumbs
        }), true).render();
      }
    });

    FauxtonAPI.RouteObject.on('renderComplete', function (routeObject) {
      var masterLayout = FauxtonAPI.masterLayout;

      if (routeObject.get('apiUrl')) {
        masterLayout.apiBar.show();
        masterLayout.apiBar.update(routeObject.get('apiUrl'));
      } else {
        masterLayout.apiBar.hide();
      }
    });

    var primaryNavBarEl = $('#primary-navbar')[0];
    if (primaryNavBarEl) {
      NavbarReactComponents.renderNavBar(primaryNavBarEl);
    }

    var versionInfo = new Fauxton.VersionInfo();

    versionInfo.fetch().then(function () {
      NavigationActions.setNavbarVersionInfo(versionInfo.get("version"));
    });
  };

  Fauxton.VersionInfo = Backbone.Model.extend({
    url: function () {
      return app.host;
    }
  });

  Fauxton.Notification = FauxtonAPI.View.extend({
    animationTimer: 5000,
    id: 'global-notification-id',
    events: {
      'click .js-dismiss': 'onClickRemoveWithAnimation'
    },

    initialize: function (options) {
      this.htmlToRender = options.msg;
      // escape always, except the value is false
      if (options.escape !== false) {
        this.htmlToRender = _.escape(this.htmlToRender);
      }
      this.type = options.type || "info";
      this.selector = options.selector;
      this.fade = options.fade === undefined ? true : options.fade;
      this.data = options.data || "";
      this.template = options.template || "addons/fauxton/templates/notification";
    },

    serialize: function () {
      var icon;

      switch (this.type) {
        case 'error':
          icon = 'fonticon-attention-circled';
        break;
        case 'info':
          icon = 'fonticon-info-circled';
        break;
        case 'success':
          icon = 'fonticon-ok-circled';
        break;
        default:
          icon = 'fonticon-info-circled';
        break;
      }

      return {
        icon: icon,
        data: this.data,
        htmlToRender: this.htmlToRender,
        type: this.type
      };
    },

    onClickRemoveWithAnimation: function (event) {
      event.preventDefault();
      window.clearTimeout(this.timeout);
      this.removeWithAnimation();
    },

    removeWithAnimation: function () {
      this.$el.velocity('reverse', FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED, function () {
        this.$el.remove();
        this.removeCloseListener();
      }.bind(this));
    },

    addCloseListener: function () {
      $(document).on('keydown.notificationClose', this.onKeyDown.bind(this));
    },

    onKeyDown: function (e) {
      var code = e.keyCode || e.which;
      if (code === 27) { // ESC key
        this.removeWithAnimation();
      }
    },

    removeCloseListener: function () {
      $(document).off('keydown.notificationClose', this.removeWithAnimation);
    },

    delayedRemoval: function () {
      this.timeout = setTimeout(function () {
        this.removeWithAnimation();
      }.bind(this), this.animationTimer);
    },

    renderNotification: function (selector) {
      selector = selector || this.selector;
      if (this.clear) {
        $(selector).html('');
      }
      this.render().$el.appendTo(selector);
      this.$el.velocity('transition.slideDownIn', FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED);
      this.delayedRemoval();
      this.addCloseListener();
      return this;
    }
  });

  return Fauxton;
});
