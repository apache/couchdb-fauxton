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
import React from "react";

import Components from "./components";
import NotificationComponents from "./notifications/notifications.react";
import Actions from "./notifications/actions";
import NavbarReactComponents from "./navigation/components.react";
import NavigationActions from "./navigation/actions";
import ReactComponents from "../components/react-components.react";
import ComponentActions from "../components/actions";
import {Breadcrumbs} from '../components/header-breadcrumbs';

import "./assets/less/fauxton.less";

var Fauxton = FauxtonAPI.addon();


Fauxton.initialize = function () {

  FauxtonAPI.RouteObject.on('beforeEstablish', function (routeObject) {
    NavigationActions.setNavbarActiveLink(_.result(routeObject, 'selectedHeader'));

    // always attempt to render the API Bar. Even if it's hidden on initial load, it may be enabled later
    routeObject.setComponent('#api-navbar', ReactComponents.ApiBarController, {
      buttonVisible: true,
      contentVisible: false
    });

    const apiAndDocs = routeObject.get('apiUrl');
    if (apiAndDocs) {
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

    // XXX React softmigration, remove after full breadcrumb rewrite
    if (routeObject.overrideBreadcrumbs) { return; }

    FauxtonAPI.masterLayout.removeView('#breadcrumbs');

    const crumbs = routeObject.get('crumbs');

    if (!crumbs.length) {
      return;
    }

    routeObject.setComponent('#breadcrumbs', Breadcrumbs, {crumbs: crumbs});
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
