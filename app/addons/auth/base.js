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

import FauxtonAPI from "../../core/api";
import RouteObjects from './routes';
import "./assets/less/auth.less";
import Session from './session';

const cleanupAuthSection = () => {
  FauxtonAPI.removeHeaderLink({ id: 'auth', bottomNav: true });
};

FauxtonAPI.setSession(new Session({allowAdminParty: true}));

export default ({
  initialize: () => {
    FauxtonAPI.addHeaderLink({
      id: 'auth',
      title: 'Login',
      href: '#/login',
      icon: 'fonticon-user',
      bottomNav: true
    });

    FauxtonAPI.session.onChange(() => {
      const session = FauxtonAPI.session;
      let link;

      if (session.isAdminParty()) {
        link = {
          id: 'auth',
          title: 'Admin Party!',
          href: '#/createAdmin',
          icon: 'fonticon-user',
          bottomNav: true
        };

        cleanupAuthSection();
        FauxtonAPI.addHeaderLink(link);
        FauxtonAPI.hideLogin();

      } else if (session.isLoggedIn()) {
        link = {
          id: 'auth',
          title: 'Your Account',
          href: '#/changePassword',
          icon: 'fonticon-user',
          bottomNav: true
        };

        cleanupAuthSection();
        FauxtonAPI.addHeaderLink(link);
        FauxtonAPI.showLogout();
      } else {
        cleanupAuthSection();
        FauxtonAPI.showLogin();
      }
    });
  },
  RouteObjects
});
