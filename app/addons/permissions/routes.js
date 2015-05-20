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
  'app',
  'api',
  'addons/databases/base',
  'addons/permissions/resources',
  'addons/permissions/actions',
  'addons/permissions/components.react',
  'addons/documents/shared-routes'
],
function (app, FauxtonAPI, Databases, Resources, Actions, Permissions, BaseRoute) {

  var PermissionsRouteObject = BaseRoute.extend({
    roles: ['fx_loggedIn'],
    routes: {
      'database/:database/permissions': 'permissions'
    },

    initialize: function (route, masterLayout, options) {
      var docOptions = app.getParams();
      docOptions.include_docs = true;

      this.initViews(options[0]);
      this.listenToLookaheadTray();
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

    listenToLookaheadTray: function () {
      this.listenTo(FauxtonAPI.Events, 'lookaheadTray:update', this.onSelectDatabase);
    },

    onSelectDatabase: function (dbName) {
      this.cleanup();
      this.initViews(dbName);

      FauxtonAPI.navigate('/database/' + app.utils.safeURLName(dbName) + '/permissions', {
        trigger: true
      });
      this.listenToLookaheadTray();
    },

    permissions: function () {
      Actions.fetchPermissions(this.database, this.security);
      this.setComponent('#dashboard-content', Permissions.PermissionsController);
    },

    crumbs: function () {
      return [
        { name: this.database.id, link: Databases.databaseUrl(this.database)},
        { name: 'Permissions', link: '/permissions' }
      ];
    },

    cleanup: function () {
      if (this.pageContent) {
        this.removeView('#dashboard-content');
      }
      if (this.leftheader) {
        this.removeView('#breadcrumbs');
      }
      if (this.sidebar) {
        this.removeView('#sidebar');
      }
      this.stopListening(FauxtonAPI.Events, 'lookaheadTray:update', this.onSelectDatabase);
    }
  });

  Permissions.RouteObjects = [PermissionsRouteObject];

  return Permissions;
});
