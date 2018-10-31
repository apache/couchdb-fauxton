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
import app from '../../app';
import FauxtonAPI from '../../core/api';
import Databases from '../databases/base';
import BaseRoute from '../documents/shared-routes';
import Layout from './layout';

const PermissionsRouteObject = BaseRoute.extend({

  roles: ['fx_loggedIn'],
  routes: {
    'database/:database/_partition/:partitionKey/permissions': {
      route: 'permissions',
      roles: ['fx_loggedIn']
    },
    'database/:database/permissions': {
      route: 'permissions',
      roles: ['fx_loggedIn']
    }
  },

  initialize: function () {
    const docOptions = app.getParams();

    docOptions.include_docs = true;
  },

  permissions: function (databaseId, partitionKey) {

    // XXX magic inheritance props we need to maintain for BaseRoute
    this.database = new Databases.Model({ id: databaseId });

    // XXX magic methods we have to call - originating from BaseRoute.extend
    this.createDesignDocsCollection();
    this.addSidebar('permissions');

    const crumbs = [
      { name: this.database.id, link: Databases.databaseUrl(databaseId)},
      { name: 'Permissions' }
    ];

    const encodedDatabaseId = encodeURIComponent(databaseId);
    const url = FauxtonAPI.urls('permissions', 'server', encodedDatabaseId);

    return <Layout
      docURL={FauxtonAPI.constants.DOC_URLS.DB_PERMISSION}
      endpoint={url}
      dbName={this.database.id}
      dropDownLinks={crumbs}
      database={this.database}
      partitionKey={partitionKey} />;

  }
});

const Permissions = {
  RouteObjects: [PermissionsRouteObject]
};

export default Permissions;
