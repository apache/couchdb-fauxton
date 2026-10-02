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
import FauxtonAPI from '../../core/api';
import Helpers from '../../helpers';
import {OnePaneSimpleLayout} from '../components/layouts';
import NewUserForm from './components/NewUserForm';
import Constants from './constants';

const NewUserRouteObject = FauxtonAPI.RouteObject.extend({
  selectedHeader: 'Databases',

  roles: ['fx_loggedIn'],

  // Must be registered after the documents addon so this route takes
  // precedence over the generic 'database/:database/:doc' doc editor route.
  routes: {
    'database/_users/_new_user': 'newUser'
  },

  newUser: function () {
    const usersDbLink = FauxtonAPI.urls('allDocs', 'app', FauxtonAPI.url.encode(Constants.USERS_DB));
    const crumbs = [
      { name: Constants.USERS_DB, link: usersDbLink },
      { name: 'New User' }
    ];

    return <OnePaneSimpleLayout
      crumbs={crumbs}
      endpoint={Helpers.getApiUrl('/' + Constants.USERS_DB)}
      docURL={FauxtonAPI.constants.DOC_URLS.USERS_DB}
      component={<NewUserForm
        onUserCreated={() => FauxtonAPI.navigate('#/' + usersDbLink, {trigger: true})}
      />}
    />;
  }
});

export default {
  NewUserRouteObject
};
