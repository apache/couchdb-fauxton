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
  'addons/documents/shared-routes',
  "addons/documents/views",
  "addons/documents/views-changes",
  "addons/documents/views-index",
  "addons/documents/views-doceditor",

  "addons/databases/base",
  "addons/documents/resources",
  "addons/fauxton/components",
  "addons/documents/stores"
],

function(app, FauxtonAPI, BaseRoute, Documents, Changes, Index, DocEditor, Databases, Resources, Components, Stores) {


  var DocumentsRouteObject = BaseRoute.extend({
    layout: "with_tabs_sidebar",
    routes: {
      "database/:database/_all_docs(:extra)": {
        route: "allDocs",
        roles: ["fx_loggedIn"]
      },
      "database/:database/_design/:ddoc/_view/:view": {
        route: "viewFn",
        roles: ['fx_loggedIn']
      },
      "database/:database/_design/:ddoc/_lists/:fn": {
        route: "tempFn",
        roles: ['fx_loggedIn']
      },
      "database/:database/_design/:ddoc/_filters/:fn": {
        route: "tempFn",
        roles: ['fx_loggedIn']
      },
      "database/:database/_design/:ddoc/_show/:fn": {
        route: "tempFn",
        roles: ['fx_loggedIn']
      },
      "database/:database/_design/:ddoc/metadata": {
        route: "designDocMetadata",
        roles: ['fx_loggedIn']
      },
      "database/:database/new_view": "newViewEditor",
      "database/:database/new_view/:designDoc": "newViewEditor",
      "database/:database/_changes(:params)": "changes"
    },

    events: {
      "route:updateAllDocs": "updateAllDocsFromView",
      "route:reloadDesignDocs": "reloadDesignDocs",
      "route:paginate": "paginate",
      "route:perPageChange": "perPageChange",
      "route:changesFilterAdd": "addFilter",
      "route:changesFilterRemove": "removeFilter",
      "route:updateQueryOptions": "updateQueryOptions"
    },

    initialize: function (route, masterLayout, options) {
      this.initViews(options[0]);
      this.listenToLookaheadTray();
    },

    establish: function () {
      return [
        this.designDocs.fetch({reset: true}),
        this.allDatabases.fetchOnce()
      ];
    },

    initViews: function (dbName) {
      this.databaseName = dbName;
      this.database = new Databases.Model({id: this.databaseName});
      this.allDatabases = new Databases.List();

      this.createDesignDocsCollection();

      this.rightHeader = this.setView("#right-header", new Documents.Views.RightAllDocsHeader({
        database: this.database
      }));

      this.addLeftHeader();
      this.addSidebar();
    },

    // this safely assumes the db name is valid
    onSelectDatabase: function (dbName) {
      this.cleanup();
      this.initViews(dbName);

      FauxtonAPI.navigate('/database/' + app.utils.safeURLName(dbName) + '/_all_docs', {
        trigger: true
      });

      // we need to start listening again because cleanup() removed the listener, but in this case
      // initialize() doesn't fire to re-set up the listener
      this.listenToLookaheadTray();
    },

    listenToLookaheadTray: function () {
      this.listenTo(FauxtonAPI.Events, 'lookaheadTray:update', this.onSelectDatabase);
    },

    designDocMetadata: function (database, ddoc) {
      this.footer && this.footer.remove();
      this.toolsView && this.toolsView.remove();
      this.viewEditor && this.viewEditor.remove();

      var designDocInfo = new Resources.DdocInfo({ _id: "_design/" + ddoc }, { database: this.database });
      this.setView("#dashboard-lower-content", new Documents.Views.DdocInfo({
        ddocName: ddoc,
        model: designDocInfo
      }));

      this.sidebar.setSelectedTab(app.utils.removeSpecialCharacters(ddoc)+"_metadata");
      this.leftheader.updateCrumbs(this.getCrumbs(this.database));
      this.rightHeader.hideQueryOptions();

      this.apiUrl = [designDocInfo.url('apiurl'), designDocInfo.documentation()];
    },

    tempFn: function(databaseName, ddoc, fn){
      this.setView("#dashboard-upper-content", new Documents.Views.temp({}));
      this.crumbs = function () {
        return [
          {"name": this.database.id, "link": Databases.databaseUrl(this.database)},
        ];
      };
    },

    createParams: function (options) {
      var urlParams = app.getParams(options),
          params = Documents.QueryParams.parse(urlParams),
          limit = this.getDocPerPageLimit(params, FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE);

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
      docParams = params.docParams,
      collection;

      if (this.eventAllDocs) {
        this.eventAllDocs = false;
        return;
      }

      this.footer = this.setView('#footer', new Documents.Views.Footer());

      this.leftheader.updateCrumbs(this.getCrumbs(this.database));

      this.database.buildAllDocs(docParams);
      collection = this.database.allDocs;

      if (docParams.startkey && docParams.startkey.indexOf("_design") > -1) {
        this.sidebar.setSelectedTab("design-docs");
      } else {
        this.sidebar.setSelectedTab("all-docs");
      }

      this.viewEditor && this.viewEditor.remove();
      this.database.allDocs.paging.pageSize = this.getDocPerPageLimit(urlParams, parseInt(docParams.limit, 10));

      if (!docParams) {
        docParams = {};
      }
      this.perPageDefault = docParams.limit || FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;

      this.pagination = new Components.IndexPagination({
        collection: collection,
        scrollToSelector: '.scrollable',
        docLimit: urlParams.limit,
        perPage: this.perPageDefault
      });
      this.setView('#documents-pagination', this.pagination);

      this.allDocsNumber = new Documents.Views.AllDocsNumber({
        collection: collection,
        pagination: this.pagination,
        perPageDefault: this.perPageDefault
      });

      this.setView('#item-numbers', this.allDocsNumber);

      // documentsView will populate the collection
      this.documentsView = this.setView("#dashboard-lower-content", new Documents.Views.AllDocsList({
        pagination: this.pagination,
        allDocsNumber: this.allDocsNumber,
        database: this.database,
        collection: collection,
        docParams: docParams,
        perPageDefault: this.perPageDefault,
        bulkDeleteDocsCollection: new Documents.BulkDeleteDocCollection([], {databaseId: this.database.get('id')})
      }));

      // this used to be a function that returned the object, but be warned: it caused a closure with a reference to
      // the initial this.database object which can change
      this.apiUrl = [this.database.allDocs.urlRef("apiurl", urlParams), this.database.allDocs.documentation()];

      // update the rightHeader with the latest & greatest info
      this.rightHeader.resetQueryOptions({ queryParams: urlParams });
      this.rightHeader.showQueryOptions();
    },

    viewFn: function (databaseName, ddoc, viewName) {
      var params = this.createParams(),
          urlParams = params.urlParams,
          docParams = params.docParams,
          decodeDdoc = decodeURIComponent(ddoc);

      viewName = viewName.replace(/\?.*$/,'');

      this.footer = this.setView('#footer', new Documents.Views.Footer());

      this.indexedDocs = new Documents.IndexCollection(null, {
        database: this.database,
        design: decodeDdoc,
        view: viewName,
        params: docParams,
        paging: {
          pageSize: this.getDocPerPageLimit(urlParams, parseInt(docParams.limit, 10))
        }
      });

      this.viewEditor = this.setView("#dashboard-upper-content", new Index.ViewEditorReact({
        viewName: viewName,
        newView: false,
        database: this.database,
        designDocs: this.designDocs,
        designDocId: "_design/" + decodeDdoc
      }));

      this.toolsView && this.toolsView.remove();

      this.documentsView = this.createViewDocumentsView({
        designDoc: decodeDdoc,
        docParams: docParams,
        urlParams: urlParams,
        database: this.database,
        indexedDocs: this.indexedDocs,
        designDocs: this.designDocs,
        view: viewName
      });

      this.sidebar.setSelectedTab(app.utils.removeSpecialCharacters(ddoc) + '_' + app.utils.removeSpecialCharacters(viewName));

      this.apiUrl = function() {
        return [this.indexedDocs.urlRef("apiurl", urlParams), FauxtonAPI.constants.DOC_URLS.GENERAL];
      };

      this.showQueryOptions(urlParams, ddoc, viewName);
    },

    showQueryOptions: function (urlParams, ddoc, viewName) {
      var promise = this.designDocs.fetch({reset: true}),
      that = this,
      hasReduceFunction;

      promise.then(function(resp) {
        var design = _.findWhere(that.designDocs.models, {id: '_design/'+ddoc}); 
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

    ddocInfo: function (designDoc, designDocs, view) {
      return {
        id: "_design/" + designDoc,
        currView: view,
        designDocs: designDocs
      };
    },

    createViewDocumentsView: function (options) {
      if (!options.docParams) {
        options.docParams = {};
      }

      this.perPageDefault = options.docParams.limit || FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;

      this.pagination = new Components.IndexPagination({
        collection: options.indexedDocs,
        scrollToSelector: '.scrollable',
        docLimit: options.urlParams.limit,
        perPage: this.perPageDefault
      });
      this.setView('#documents-pagination', this.pagination);

      this.allDocsNumber = new Documents.Views.AllDocsNumber({
        collection: options.indexedDocs,
        pagination: this.pagination,
        perPageDefault: this.perPageDefault
      });

      this.setView('#item-numbers', this.allDocsNumber);

      return this.setView("#dashboard-lower-content", new Documents.Views.AllDocsList({
        pagination: this.pagination,
        allDocsNumber: this.allDocsNumber,
        database: options.database,
        collection: options.indexedDocs,
        viewList: true,
        ddocInfo: this.ddocInfo(options.designDoc, options.designDocs, options.view),
        docParams: options.docParams,
        perPageDefault: this.perPageDefault,
      }));
    },

    newViewEditor: function (database, _designDoc) {
      var params = app.getParams();
      var newDesignDoc = true;
      var designDoc;
        
      if (!_.isUndefined(_designDoc)) {
        designDoc = "_design/" + _designDoc;
        newDesignDoc = false;
      }

      this.footer && this.footer.remove();
      this.toolsView && this.toolsView.remove();
      this.documentsView && this.documentsView.remove();

      this.viewEditor = this.setView("#dashboard-upper-content", new Index.ViewEditorReact({
        viewName: 'new-view',
        newView: true,
        database: this.database,
        designDocs: this.designDocs,
        designDocId: designDoc,
        newDesignDoc: newDesignDoc
      }));

      this.sidebar.setSelectedTab("new-view");
      this.rightHeader.hideQueryOptions();

      // clear out anything that was in the lower section
      this.removeView("#dashboard-lower-content");
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
      defaultPageSize = isLazyInit ? FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE : this.documentsView.perPage();
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

      this.documentsView.setParams(docParams, urlParams);

      // this will lazily initialize all sub-views and render them
      this.documentsView.forceRender();
    },

    perPageChange: function (perPage) {
      // We need to restore the collection parameters to the defaults (1st page)
      // and update the page size
      this.perPage = perPage;
      this.documentsView.forceRender();
      this.documentsView.collection.pageSizeReset(perPage, {fetch: false});
      this.allDocsNumber.forceRender();
      this.setDocPerPageLimit(perPage);
    },

    paginate: function (options) {
      var collection = this.documentsView.collection;
      this.documentsView.collection.reset(collection);

      this.documentsView.forceRender();
      this.allDocsNumber.forceRender();

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

      this.footer && this.footer.remove();
      this.toolsView && this.toolsView.remove();
      this.viewEditor && this.viewEditor.remove();

      this.sidebar.setSelectedTab('changes');
      this.leftheader.updateCrumbs(this.getCrumbs(this.database));
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

    updateQueryOptions: function(options) {
      this.rightHeader.updateQueryOptions(options);
    },

    cleanup: function () {
      if (this.viewEditor) {
        this.removeView('#dashboard-upper-content');
      }
      if (this.documentsView) {
        this.removeView('#dashboard-lower-content');
      }
      if (this.rightHeader) {
        this.removeView('#right-header');
      }
      if (this.leftheader) {
        this.removeView('#breadcrumbs');
      }
      if (this.sidebar) {
        this.removeView('#sidebar');
      }
      if (this.footer) {
        this.removeView('#footer');
      }

      // we're no longer interested in listening to the lookahead tray event on this route object
      this.stopListening(FauxtonAPI.Events, 'lookaheadTray:update', this.onSelectDatabase);
    }

  });

  return DocumentsRouteObject;
});
