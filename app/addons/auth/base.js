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
  "addons/auth/routes"
],

function(app, FauxtonAPI, Auth) {

  Auth.session = new Auth.Session();
  FauxtonAPI.setSession(Auth.session);
  app.session = Auth.session;

  Auth.initialize = function() {

    FauxtonAPI.addHeaderLink({
      id: "auth",
      title: "Login", 
      href: "#login",
      icon: "fonticon-user",
      bottomNav: true,
    });

    Auth.session.on('change', function () {
      var session = Auth.session;
      var link = {};

      if (session.isAdminParty()) {
        link = {
          id: "auth",
          title: "Admin Party!", 
          href: "#createAdmin",
          icon: "fonticon-user",
          bottomNav: true,
        };
      } else if (session.isLoggedIn()) {
        link = {
          id: "auth",
          title: session.user().name, 
          href: "#changePassword",
          icon: "fonticon-user",
          bottomNav: true,
        };

        FauxtonAPI.addHeaderLink({
          id: 'logout',
          footerNav: true, 
          href: "#logout", 
          title: "Logout", 
          icon: "", 
          className: 'logout'
        });
      } else {
        link = {
          id: "auth",
          title: 'Login', 
          href: "#login",
          icon: "fonticon-user",
          bottomNav: true,
        };
        FauxtonAPI.removeHeaderLink({id: "logout", footerNav: true});
      }
      FauxtonAPI.updateHeaderLink(link);

    });

    Auth.session.fetchUser().then(function () {
      Auth.session.trigger('change');
    });

    var auth = function (session, roles) {
      var deferred = $.Deferred();

      if (session.isAdminParty()) {
        session.trigger("authenticated");
        deferred.resolve();
      } else if(session.matchesRoles(roles)) {
        session.trigger("authenticated");
        deferred.resolve();
      } else {
        deferred.reject();
      }

      return [deferred];
    };

    var authDenied = function () {
      var url = window.location.hash.replace('#','');
      FauxtonAPI.navigate('/login?urlback=' + url, {replace: true});
    };

    FauxtonAPI.auth.registerAuth(auth);
    FauxtonAPI.auth.registerAuthDenied(authDenied);
  };

  return Auth;
});
