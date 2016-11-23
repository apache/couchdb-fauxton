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

import React from 'react';
import app from "../../app";
import FauxtonAPI from "../../core/api";
import Auth from "./resources";
import AuthActions from "./actions";
import Components from "./components.react";
import ClusterActions from "../cluster/cluster.actions";
import {AuthLayout, AdminLayout} from './layout';

const {LoginForm, CreateAdminForm} = Components;

var AuthRouteObject = FauxtonAPI.RouteObject.extend({
  layout: 'empty',

  routes: {
    'login?*extra': 'login',
    'login': 'login',
    'logout': 'logout',
    'createAdmin': 'checkNodes',
    'createAdmin/:node': 'createAdminForNode'
  },
  hideNotificationCenter: true,
  hideApiBar: true,

  checkNodes: function () {
    ClusterActions.navigateToNodeBasedOnNodeCount('/createAdmin/');
  },

  login: function () {
    const crumbs = [{ name: 'Log In to CouchDB' }];
    this.setComponent(".template", AuthLayout, {
      crumbs: crumbs,
      component: <LoginForm urlBack={app.getParams().urlback } />
    });
  },

  logout: function () {
    FauxtonAPI.addNotification({ msg: 'You have been logged out.' });
    FauxtonAPI.session.logout().then(function () {
      FauxtonAPI.navigate('/');
    });
  },

  createAdminForNode: function () {
    ClusterActions.fetchNodes();
    const crumbs = [{ name: 'Create Admin' }];
    this.setComponent(".template", AuthLayout, {
      crumbs: crumbs,
      component: <CreateAdminForm loginAfter={true} />
    });
  }
});


var UserRouteObject = FauxtonAPI.RouteObject.extend({
  layout: 'empty',
  hideNotificationCenter: true,
  hideApiBar: true,

  routes: {
    'changePassword': {
      route: 'checkNodesForPasswordChange',
      roles: ['fx_loggedIn']
    },
    'changePassword/:node': {
      route: 'changePassword',
      roles: ['fx_loggedIn']
    },
    'addAdmin': {
      route: 'checkNodesForAddAdmin',
      roles: ['_admin']
    },
    'addAdmin/:node': {
      route: 'addAdmin',
      roles: ['_admin']
    }
  },

  checkNodesForPasswordChange: function () {
    ClusterActions.navigateToNodeBasedOnNodeCount('/changePassword/');
  },

  checkNodesForAddAdmin: function () {
    ClusterActions.navigateToNodeBasedOnNodeCount('/addAdmin/');
  },

  selectedHeader: function () {
    return FauxtonAPI.session.user().name;
  },

  changePassword: function () {
    ClusterActions.fetchNodes();
    AuthActions.selectPage('changePassword');
    this.setComponent(".template", AdminLayout, {
      crumbs: [{name: 'User Management'}],
      changePassword: true
    });
  },

  addAdmin: function () {
    ClusterActions.fetchNodes();
    AuthActions.selectPage('addAdmin');
    this.setComponent(".template", AdminLayout, {
      crumbs: [{name: 'User Management'}],
      changePassword: false
    });
  },

});

Auth.RouteObjects = [AuthRouteObject, UserRouteObject];

export default Auth;
