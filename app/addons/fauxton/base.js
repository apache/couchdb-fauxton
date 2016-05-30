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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import Components from "./components";
import NotificationComponents from "./notifications/notifications.react";
import Actions from "./notifications/actions";
import NavbarReactComponents from "./navigation/components.react";
import NavigationActions from "./navigation/actions";
import ReactComponents from "../components/react-components.react";
import ComponentActions from "../components/actions";
import "./assets/less/fauxton.less";

var Fauxton = FauxtonAPI.addon();
FauxtonAPI.addNotification = function (options) {
  options = _.extend({
    msg: 'Notification Event Triggered!',
    type: 'info',
    escape: true,
    clear: false
  }, options);

  // log all notifications in a store
  Actions.addNotification(options);
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

  FauxtonAPI.RouteObject.on('beforeEstablish', function (routeObject) {
    NavigationActions.setNavbarActiveLink(_.result(routeObject, 'selectedHeader'));

    // always attempt to render the API Bar. Even if it's hidden on initial load, it may be enabled later
    routeObject.setComponent('#api-navbar', ReactComponents.ApiBarController, {
      buttonVisible: true,
      contentVisible: false
    });

    if (routeObject.get('apiUrl')) {
      var apiAndDocs = routeObject.get('apiUrl');

      ComponentActions.updateAPIBar({
        buttonVisible: true,
        contentVisible: false,
        endpoint: apiAndDocs[0],
        docURL: apiAndDocs[1]
      });
    } else {
      ComponentActions.hideAPIBarButton();
    }

    if (!routeObject.get('hideNotificationCenter')) {
      routeObject.setComponent('#notification-center-btn', NotificationComponents.NotificationCenterButton);
    }

    if (routeObject.overrideBreadcrumbs) { return; }

    FauxtonAPI.masterLayout.removeView('#breadcrumbs');
    var crumbs = routeObject.get('crumbs');

    if (crumbs.length) {
      FauxtonAPI.masterLayout.setView('#breadcrumbs', new Components.Breadcrumbs({
        crumbs: crumbs
      }), true).render();
    }
  });

  var primaryNavBarEl = $('#primary-navbar')[0];
  if (primaryNavBarEl) {
    NavbarReactComponents.renderNavBar(primaryNavBarEl);
  }

  var notificationEl = $('#notifications')[0];
  if (notificationEl) {
    NotificationComponents.renderNotificationController(notificationEl);
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

export default Fauxton;
