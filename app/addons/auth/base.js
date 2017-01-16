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
import Auth from "./routes";
import "./assets/less/auth.less";

Auth.session = new Auth.Session();
FauxtonAPI.setSession(Auth.session);
app.session = Auth.session;

Auth.initialize = function () {

  FauxtonAPI.addHeaderLink({
    id: 'auth',
    title: 'Login',
    href: '#/login',
    icon: 'fonticon-user',
    bottomNav: true
  });

  Auth.session.on('change', function () {
    var session = Auth.session;
    var link = {
        id: 'auth',
        title: 'Login',
        href: '#/login',
        icon: 'fonticon-user',
        bottomNav: true
    };

    if (session.isAdminParty()) {
      link = {
        id: 'auth',
        title: 'Admin Party!',
        href: '#/createAdmin',
        icon: 'fonticon-user',
        bottomNav: true
      };
    } else if (session.isLoggedIn()) {
      link = {
        id: 'auth',
        title: session.user().name,
        href: '#/changePassword',
        icon: 'fonticon-user',
        bottomNav: true
      };

      // ensure the footer link is removed before adding it
      FauxtonAPI.removeHeaderLink({ id: 'logout', footerNav: true });
      FauxtonAPI.addHeaderLink({
        id: 'logout',
        footerNav: true,
        href: '#logout',
        title: 'Logout',
        icon: '',
        className: 'logout'
      });
    } else {
      FauxtonAPI.removeHeaderLink({ id: 'logout', footerNav: true });
    }
    FauxtonAPI.updateHeaderLink(link);
  });

  Auth.session.fetchUser().then(function () {
    Auth.session.trigger('change');
  });
};

export default Auth;
