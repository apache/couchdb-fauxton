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
import Databases from "../databases/base";
import Resources from "./resources";
import Actions from "./actions";
import BaseRoute from "../documents/shared-routes";
import Layout from './layout';
import React from 'react';

const PermissionsRouteObject = BaseRoute.extend({
  roles: ['fx_loggedIn'],
  routes: {
    'database/:database/permissions': 'permissions'
  },

  initialize: function (route, options) {
    var docOptions = app.getParams();
    docOptions.include_docs = true;

    this.initViews(options[0]);
  },

  initViews: function (databaseName) {
    this.database = new Databases.Model({ id: databaseName });
    this.security = new Resources.Security(null, {
      database: this.database
    });

    this.createDesignDocsCollection();
    this.addSidebar('permissions');
  },

  permissions: function () {
    Actions.fetchPermissions(this.database, this.security);
    const crumbs = [
      { name: this.database.id, link: Databases.databaseUrl(this.database)},
      { name: 'Permissions' }
    ];
    return <Layout
      docURL={this.security.documentation}
      endpoint={this.security.url('apiurl')}
      dbName={this.database.id}
      dropDownLinks={crumbs}
      database={this.database}
    />;
  }
});

const Permissions = {
  RouteObjects: [PermissionsRouteObject]
};

export default Permissions;
