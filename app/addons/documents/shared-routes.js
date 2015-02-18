define([
  'app',
  'api',
  'addons/documents/shared-resources',
  'addons/databases/base',
  'addons/fauxton/components'
], function (app, FauxtonAPI, Documents, Databases, Components) {


  // The Documents section is built up a lot of different route object which share code. This contains
  // base functionality that can be used across routes / addons
  var BaseRoute = FauxtonAPI.RouteObject.extend({
    layout: 'with_tabs_sidebar',
    selectedHeader: 'Databases',
    overrideBreadcrumbs: true,

    createDesignDocsCollection: function () {
      this.designDocs = new Documents.AllDocs(null, {
        database: this.database,
        paging: {
          pageSize: 500
        },
        params: {
          startkey: '_design/',
          endkey: '_design0',
          include_docs: true,
          limit: 500
        }
      });
    },

    addLeftHeader: function () {
      this.leftheader = this.setView('#breadcrumbs', new Components.LeftHeader({
        crumbs: this.getCrumbs(this.database),
        dropdownMenu: Documents.setUpDropdown(this.database),
        lookaheadTrayOptions: {
          databaseCollection: this.allDatabases,
          toggleEventName: 'lookaheadTray:toggle',
          onUpdateEventName: 'lookaheadTray:update',
          placeholder: 'Enter database name'
        }
      }));
    },

    addSidebar: function (selectedTab) {
      var params = {
        collection: this.designDocs,
        database: this.database,
        isSystemDatabaseModel: new Databases.IsSystemDatabaseModel({name: this.database.get('id')})
      };
      if (selectedTab) {
        params.selectedTab = selectedTab;
      }
      this.sidebar = this.setView("#sidebar-content", new Documents.Views.Sidebar(params));
    },

    getCrumbs: function (database) {
      var name = _.isObject(database) ? database.id : database,
        dbname = app.utils.safeURLName(name);

      return [
        { "type": "back", "link": FauxtonAPI.urls('allDBs', 'app')},
        { "name": database.id, "link": FauxtonAPI.urls('allDocs', 'app', dbname, '?limit=' + Databases.DocLimit), className: "lookahead-tray-link" }
      ];
    }
  });


  return BaseRoute;
});
