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
  'addons/auth/resources',
  'addons/auth/actions',
  'addons/auth/components.react'
],

function (app, FauxtonAPI, Auth, AuthActions, Components) {

  var AuthRouteObject = FauxtonAPI.RouteObject.extend({
    layout: 'one_pane',

    routes: {
      'login?*extra': 'login',
      'login': 'login',
      'logout': 'logout',
      'createAdmin': 'createAdmin'
    },

    login: function () {
      this.crumbs = [{ name: 'Login', link: "#" }];

      this.setComponent('#dashboard-content', Components.LoginForm, { urlBack: app.getParams().urlback });
    },

    logout: function () {
      FauxtonAPI.addNotification({ msg: 'You have been logged out.' });
      FauxtonAPI.session.logout().then(function () {
        FauxtonAPI.navigate('/');
      });
    },

    changePassword: function () {
      this.crumbs = [{name: 'Change Password', link: "#" }];
      this.setComponent('#dashboard-content', Components.ChangePasswordForm);
    },

    createAdmin: function () {
      this.crumbs = [{name: 'Create Admin', link:"#"}];
      this.setComponent('#dashboard-content', Components.CreateAdminForm, { loginAfter: true });
    }
  });


  var UserRouteObject = FauxtonAPI.RouteObject.extend({
    layout: 'with_sidebar',

    routes: {
      'changePassword': {
        route: 'changePassword',
        roles: ['fx_loggedIn']
      },
      'addAdmin': {
        route: 'addAdmin',
        roles: ['_admin']
      }
    },

    selectedHeader: function () {
      return FauxtonAPI.session.user().name;
    },

    initialize: function () {
      this.setComponent('#sidebar-content', Components.CreateAdminSidebar);
    },

    changePassword: function () {
      AuthActions.selectPage('changePassword');
      this.setComponent('#dashboard-content', Components.ChangePasswordForm);
    },

    addAdmin: function () {
      AuthActions.selectPage('addAdmin');
      this.setComponent('#dashboard-content', Components.CreateAdminForm, { loginAfter: false });
    },

    crumbs: [{name: 'User Management', link: '#'}]
  });

  Auth.RouteObjects = [AuthRouteObject, UserRouteObject];

  return Auth;
});
