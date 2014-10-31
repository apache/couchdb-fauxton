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
  "app",
  "api",

  // Modules
  //views
  "addons/documents/views",
  "addons/documents/views-changes",
  "addons/documents/views-doceditor",

  "addons/databases/base",
  "addons/documents/resources",
  "addons/fauxton/components"
],

function(app, FauxtonAPI, Documents, Changes, DocEditor, Databases, Resources, Components) {

  var crumbs = {
    allDocs: function (database) {
      return [
        {"name": "", "className": "fonticon-left-open", "link": "/_all_dbs"},
        {"name": database.id, "link": Databases.databaseUrl(database)}
      ];
    },

    changes: function (database) {
      return [
        {"name": "", "className": "fonticon-left-open", "link": "/_all_dbs"},
        {"name": database.id, "link": Databases.databaseUrl(database)}
      ];
    }
  };

  var DocumentsRouteObject = FauxtonAPI.RouteObject.extend({
    layout: "with_tabs_sidebar",
    selectedHeader: "Databases",
    routes: {

      "database/:database/_all_docs(:extra)": {
        route: "allDocs",
        roles: ["fx_loggedIn"]
      },
      "database/:database/_design/:ddoc/metadata": {
        route: "designDocMetadata",
        roles: ['fx_loggedIn']
      },
      "database/:database/_changes(:params)": "changes"
    },

    events: {
      "route:updateAllDocs": "updateAllDocsFromView",
      "route:reloadDesignDocs": "reloadDesignDocs",
      "route:paginate": "paginate",
      "route:perPageChange": "perPageChange",
      "route:changesFilterAdd": "addFilter",
      "route:changesFilterRemove": "removeFilter",
      "route:updateQueryOptions": "updateQueryOptions",
      "route:resetQueryOptions": "resetQueryOptions",
      "route:toggleSelectHeader": "toggleSelectheader"
    },

    showAllDocsHeader: true,

    overrideBreadcrumbs: true,

    initialize: function (route, masterLayout, options) {
      this.databaseName = options[0];
      this.database = new Databases.Model({id:this.databaseName});
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

      this.rightHeader = this.setView("#right-header", new Documents.Views.RightAllDocsHeader({
         database: this.database
      }));

      this.leftheader = this.setView("#breadcrumbs", new Components.LeftHeader({
        crumbs: crumbs.allDocs(this.database),
        dropdownMenu: this.setUpDropdown()
      }));

      this.sidebar = this.setView("#sidebar-content", new Documents.Views.Sidebar({
        collection: this.designDocs,
        database: this.database
      }));
    },

    setUpDropdown: function() {
      var defaultMenuLinks = [{
        links: [{
          title: 'Replicate Database',
          icon: 'fonticon-replicate',
          url: '#/replication/' + this.databaseName
        },{
          title: 'Delete',
          icon: 'fonticon-trash',
          trigger: 'database:delete'
        }]
      }];

      defaultMenuLinks.push({
        title: 'Add new',
        links: this.getExtensionLinks()
      });

      return defaultMenuLinks;
    },

    getExtensionLinks: function () {
      var database = this.database,
          newurlPrefix = "#" + database.url('app');

      var menuLinks = [{
        title: 'New Doc',
        url: newurlPrefix + '/new',
        icon: 'fonticon-plus-circled'
      }];

      return _.reduce(FauxtonAPI.getExtensions('sidebar:links'), function (menuLinks, link) {
        menuLinks.push({
          title: link.title,
          url: newurlPrefix + "/" + link.url,
          icon: 'fonticon-plus-circled'
        });
        return menuLinks;
      }, menuLinks);
    },

    designDocMetadata:  function(database, ddoc){
      this.toolsView && this.toolsView.remove();
      this.viewEditor && this.viewEditor.remove();

      var designDocInfo = new Resources.DdocInfo({ _id: "_design/" + ddoc }, { database: this.database });
      this.setView("#dashboard-lower-content", new Documents.Views.DdocInfo({
        ddocName: ddoc,
        model: designDocInfo
      }));

      this.sidebar.setSelectedTab(app.utils.removeSpecialCharacters(ddoc)+"_metadata");
      this.resetAllDocsHeader();
      this.rightHeader.hideQueryOptions();
      this.leftheader.updateCrumbs(crumbs.allDocs(this.database));

      this.apiUrl = [designDocInfo.url('apiurl'), designDocInfo.documentation()];
    },

    establish: function () {
      return this.designDocs.fetch({reset: true});
    },

    createParams: function (options) {
      var urlParams = app.getParams(options),
          params = Documents.QueryParams.parse(urlParams),
          limit = this.getDocPerPageLimit(params, FauxtonAPI.constants.DEFAULT_PAGE_SIZE);

      return {
        urlParams: urlParams,
        docParams: _.extend(params, {limit: limit})
      };
    },

    /*
     * docParams are the options collection uses to fetch from the server
     * urlParams are what are shown in the url and to the user
     * They are not the same when paginating
     */
    allDocs: function(databaseName, options) {
      var params = this.createParams(options),
          urlParams = params.urlParams,
          docParams = params.docParams;

      if (this.eventAllDocs) {
        this.eventAllDocs = false;
        return;
      }

      this.leftheader.updateCrumbs(crumbs.allDocs(this.database));
      this.database.buildAllDocs(docParams);

      if (docParams.startkey && docParams.startkey.indexOf("_design") > -1) {
        this.sidebar.setSelectedTab("design-docs");
      } else {
        this.sidebar.setSelectedTab("all-docs");
      }

      this.viewEditor && this.viewEditor.remove();
      this.database.allDocs.paging.pageSize = this.getDocPerPageLimit(urlParams, parseInt(docParams.limit, 10));

      this.documentsView = this.setView("#dashboard-lower-content", new Documents.Views.AllDocsList({
        database: this.database,
        collection: this.database.allDocs,
        docParams: docParams,
        params: urlParams,
        bulkDeleteDocsCollection: new Documents.BulkDeleteDocCollection([], {databaseId: this.database.get('id')})
      }));

      this.apiUrl = function() {
       return [this.database.allDocs.urlRef("apiurl", urlParams), this.database.allDocs.documentation()];
      };

      // update the rightHeader with the latest & greatest info
      this.rightHeader.resetQueryOptions({ queryParams: urlParams });
      this.rightHeader.showQueryOptions();
    },

    ddocInfo: function (designDoc, designDocs, view) {
      return {
        id: "_design/" + designDoc,
        currView: view,
        designDocs: designDocs
      };
    },

    toggleSelectheader: function () {
      /* --------------------------------------------------
        Set up right header for the document select menu
        or reset back to all docs header
      ----------------------------------------------------*/
      if (this.showAllDocsHeader) {
        this.showAllDocsHeader = false;
        this.rightHeader = this.setView('#right-header', new Documents.Views.SelectMenuHeader());
        this.rightHeader.forceRender();
        return;
      }
      this.resetAllDocsHeader();
    },

    resetAllDocsHeader: function () {
      this.rightHeader = this.setView('#right-header', new Documents.Views.RightAllDocsHeader({
        database: this.database
      }));
      this.rightHeader.forceRender();
      this.showAllDocsHeader = true;
    },

    updateAllDocsFromView: function (event) {
      var view = event.view,
          params = this.createParams(),
          urlParams = params.urlParams,
          docParams = params.docParams,
          ddoc = event.ddoc,
          defaultPageSize,
          isLazyInit,
          pageSize,
          collection;

      isLazyInit = _.isUndefined(this.documentsView) || _.isUndefined(this.documentsView.allDocsNumber);
      defaultPageSize = isLazyInit ? FauxtonAPI.constants.DEFAULT_PAGE_SIZE : this.documentsView.perPage();
      docParams.limit = pageSize = this.getDocPerPageLimit(urlParams, defaultPageSize);

      if (event.allDocs) {
        this.eventAllDocs = true; // this is horrible. But I cannot get the trigger not to fire the route!
        this.database.buildAllDocs(docParams);
        collection = this.database.allDocs;
        collection.paging.pageSize = pageSize;
      } else {
        collection = this.indexedDocs = new Documents.IndexCollection(null, {
          database: this.database,
          design: ddoc,
          view: view,
          params: docParams,
          paging: {
            pageSize: pageSize
          }
        });

        if (!this.documentsView) {
          this.documentsView = this.createViewDocumentsView({
            designDoc: ddoc,
            docParams: docParams,
            urlParams: urlParams,
            database: this.database,
            indexedDocs: this.indexedDocs,
            designDocs: this.designDocs,
            view: view
          });
        }
      }

      // this will lazily initialize all sub-views and render them
      this.documentsView.forceRender();
      this.documentsView.setParams(docParams, urlParams);
    },

    perPageChange: function (perPage) {
      // We need to restore the collection parameters to the defaults (1st page)
      // and update the page size
      this.perPage = perPage;
      this.documentsView.forceRender();
      this.documentsView.collection.pageSizeReset(perPage, {fetch: false});
      this.setDocPerPageLimit(perPage);
    },

    paginate: function (options) {
      var collection = this.documentsView.collection;

      this.documentsView.forceRender();
      collection.paging.pageSize = options.perPage;
      var promise = collection[options.direction]({fetch: false});
    },

    reloadDesignDocs: function (event) {
      this.sidebar.forceRender();

      if (event && event.selectedTab) {
        this.sidebar.setSelectedTab(event.selectedTab);
      }
    },

    setDocPerPageLimit: function (perPage) {
      app.utils.localStorageSet('fauxton:perpage', perPage);
    },

    getDocPerPageLimit: function (urlParams, perPage) {
      var storedPerPage = perPage;

      if (window.localStorage) {
        storedPerPage = app.utils.localStorageGet('fauxton:perpage');

        if (!storedPerPage) {
          this.setDocPerPageLimit(perPage);
          storedPerPage = perPage;
        } else {
          storedPerPage = parseInt(storedPerPage, 10);
        }
      }

      if (!urlParams.limit || urlParams.limit > storedPerPage) {
        return parseInt(storedPerPage, 10);
      } else {
        return parseInt(urlParams.limit, 10);
      }
    },

    changes: function () {
      var docParams = app.getParams();
      this.database.buildChanges(docParams);

      this.changesView = this.setView("#dashboard-lower-content", new Changes.Changes({
        model: this.database
      }));

      this.filterView = new Components.FilterView({
        eventNamespace: "changes"
      });

      this.headerView = this.setView("#dashboard-upper-content", new Changes.ChangesHeader({
        filterView: this.filterView
      }));

      this.toolsView && this.toolsView.remove();
      this.viewEditor && this.viewEditor.remove();

      this.sidebar.setSelectedTab('changes');
      this.leftheader.updateCrumbs(crumbs.changes(this.database));
      this.rightHeader.hideQueryOptions();

      this.apiUrl = function () {
        return [this.database.url("changes-apiurl"), this.database.documentation()];
      };
    },

    addFilter: function (filter) {
      this.changesView.filters.push(filter);
      this.changesView.render();
    },

    removeFilter: function (filter) {
      this.changesView.filters.splice(this.changesView.filters.indexOf(filter), 1);
      this.changesView.render();
    },

    resetQueryOptions: function(options) {
      this.rightHeader.resetQueryOptions(options);
    },

    updateQueryOptions: function(options) {
      this.rightHeader.updateQueryOptions(options);
    }
  });

  return DocumentsRouteObject;
});
