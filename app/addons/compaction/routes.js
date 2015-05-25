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

  // Modules
  'addons/compaction/components.react',
  'addons/compaction/actions',
  'addons/databases/resources',
  'addons/documents/shared-routes'
],

function (app, FauxtonAPI, Compaction, Actions, Databases, BaseRoute) {

  var CompactionRouteObject = BaseRoute.extend({
    routes: {
      "database/:database/compact": "compaction"
    },

    initialize: function (route, masterLayout, options) {
      this.initViews(options[0]);
      this.listenToLookaheadTray();
    },

    initViews: function (databaseName) {
      this.database = new Databases.Model({ id: databaseName });
      this.allDatabases = new Databases.List();

      this.createDesignDocsCollection();
      this.addLeftHeader();
      this.addSidebar('compact');
    },

    onSelectDatabase: function (dbName) {
      this.cleanup();
      this.initViews(dbName);
      FauxtonAPI.navigate('/database/' + app.utils.safeURLName(dbName) + '/compact', {
        trigger: true
      });
      this.listenToLookaheadTray();
    },

    listenToLookaheadTray: function () {
      this.listenTo(FauxtonAPI.Events, 'lookaheadTray:update', this.onSelectDatabase);
    },

    compaction: function () {
      Actions.setCompactionFor(this.database);
      this.pageContent = this.setComponent('#dashboard-content', Compaction.CompactionController);
    },

    establish: function () {
      return [
        this.designDocs.fetch({reset: true}),
        this.allDatabases.fetchOnce()
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

      // we're no longer interested in listening to the lookahead tray event on this route object
      this.stopListening(FauxtonAPI.Events, 'lookaheadTray:update', this.onSelectDatabase);
    }
  });

  Compaction.RouteObjects = [CompactionRouteObject];

  return Compaction;

});
