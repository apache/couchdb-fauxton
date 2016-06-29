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
import Permissions from "./components.react";
import BaseRoute from "../documents/shared-routes";

var PermissionsRouteObject = BaseRoute.extend({
  roles: ['fx_loggedIn'],
  routes: {
    'database/:database/permissions': 'permissions'
  },

  initialize: function (route, masterLayout, options) {
    var docOptions = app.getParams();
    docOptions.include_docs = true;

    this.initViews(options[0]);
  },

  initViews: function (databaseName) {
    this.database = new Databases.Model({ id: databaseName });
    this.security = new Resources.Security(null, {
      database: this.database
    });
    this.allDatabases = new Databases.List();

    this.createDesignDocsCollection();
    this.addLeftHeader();
    this.addSidebar('permissions');
  },

  apiUrl: function () {
    return [this.security.url('apiurl'), this.security.documentation];
  },

  establish: function () {
    return [
      this.designDocs.fetch({reset: true}),
      this.allDatabases.fetchOnce()
    ];
  },

  permissions: function () {
    Actions.fetchPermissions(this.database, this.security);
    this.setComponent('#dashboard-content', Permissions.PermissionsController);
  },

  crumbs: function () {
    return [
      { name: this.database.id, link: Databases.databaseUrl(this.database)},
      { name: 'Permissions' }
    ];
  },

  cleanup: function () {
    if (this.leftheader) {
      this.removeView('#breadcrumbs');
    }
    this.removeComponent('#sidebar-content');
  }
});

Permissions.RouteObjects = [PermissionsRouteObject];

export default Permissions;
