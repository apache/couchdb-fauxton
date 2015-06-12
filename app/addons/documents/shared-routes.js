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
  'addons/documents/shared-resources',
  'addons/databases/base',
  'addons/fauxton/components',
  'addons/documents/pagination/actions',
  'addons/documents/pagination/stores',
  'addons/documents/sidebar/sidebar.react',
  'addons/documents/sidebar/actions'
], function (app, FauxtonAPI, Documents, Databases, Components, PaginationActions, PaginationStores,
  SidebarComponents, SidebarActions) {


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

    onSelectDatabase: function (dbName) {
      this.cleanup();
      this.initViews(dbName);

      var url = FauxtonAPI.urls('allDocs', 'app',  app.utils.safeURLName(dbName), '');
      FauxtonAPI.navigate(url, {
        trigger: true
      });

      // we need to start listening again because cleanup() removed the listener, but in this case
      // initialize() doesn't fire to re-set up the listener
      this.listenToLookaheadTray();
    },

    listenToLookaheadTray: function () {
      this.listenTo(FauxtonAPI.Events, 'lookaheadTray:update', this.onSelectDatabase);
    },

    getAllDatabases: function () {
      return new Databases.List();  //getAllDatabases() can be overwritten instead of hard coded into initViews
    },

    showQueryOptions: function (urlParams, ddoc, viewName) {
      var promise = this.designDocs.fetch({reset: true}),
      that = this,
      hasReduceFunction;

      promise.then(function (resp) {
        var design = _.findWhere(that.designDocs.models, {id: '_design/' + ddoc});
        !_.isUndefined(hasReduceFunction = design.attributes.doc.views[viewName].reduce);

        that.rightHeader.showQueryOptions();
        that.rightHeader.resetQueryOptions({
          queryParams: urlParams,
          showStale: true,
          hasReduce: hasReduceFunction,
          viewName: viewName,
          ddocName: ddoc
        });
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
      var options = {
        designDocs: this.designDocs,
        database: this.database
      };

      if (selectedTab) {
        options.selectedTab = selectedTab;
      }

      SidebarActions.newOptions(options);
      this.setComponent("#sidebar-content", SidebarComponents.SidebarController);
    },

    getCrumbs: function (database) {
      var name = _.isObject(database) ? database.id : database,
        dbname = app.utils.safeURLName(name);

      return [
        { "type": "back", "link": FauxtonAPI.urls('allDBs', 'app')},
        { "name": database.id, "link": FauxtonAPI.urls('allDocs', 'app', dbname, '?limit=' + Databases.DocLimit), className: "lookahead-tray-link" }
      ];
    },

    ddocInfo: function (designDoc, designDocs, view) {
      return {
        id: "_design/" + designDoc,
        currView: view,
        designDocs: designDocs
      };
    },

    createParams: function (options) {
      var urlParams = app.getParams(options),
          params = Documents.QueryParams.parse(urlParams);

      PaginationActions.setDocumentLimit(parseInt(urlParams.limit, 10));

      var limit = PaginationStores.indexPaginationStore.getPerPage();
      return {
        urlParams: urlParams,
        docParams: _.extend(params, {limit: limit})
      };
    }
  });


  return BaseRoute;
});
