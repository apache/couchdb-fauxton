define([
  'app',
  'api',
  'addons/documents/shared-resources',
  'addons/databases/base',
  'addons/fauxton/components',
  'addons/documents/pagination/actions',
  'addons/documents/pagination/stores'
], function (app, FauxtonAPI, Documents, Databases, Components, PaginationActions, PaginationStores ) {


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

    showQueryOptions: function (urlParams, ddoc, viewName) {
      var promise = this.designDocs.fetch({reset: true}),
      that = this,
      hasReduceFunction;

      promise.then(function (resp) {
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
        database: this.database
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
    },

    createViewDocumentsView: function (options) {
      if (!options.docParams) {
        options.docParams = {};
      }

      return this.setView("#dashboard-lower-content", new Documents.Views.AllDocsList({
        database: options.database,
        collection: options.indexedDocs,
        viewList: true,
        ddocInfo: this.ddocInfo(options.designDoc, options.designDocs, options.view),
        docParams: options.docParams
      }));
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
    },

    updateAllDocsFromView: function (event) {
      var view = event.view,
          params = this.createParams(),
          urlParams = params.urlParams,
          docParams = params.docParams,
          ddoc = event.ddoc,
          pageSize = PaginationStores.indexPaginationStore.getPerPage(),
          collection;

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
    },

    perPageChange: function (perPage) {
      this.documentsView.forceRender();
      this.documentsView.collection.pageSizeReset(perPage, {fetch: false});
    },

    paginate: function (options) {
      var collection = this.documentsView.collection;
      this.documentsView.collection.reset(collection);

      this.documentsView.forceRender();

      collection.paging.pageSize = options.perPage;
      var promise = collection[options.direction]({fetch: false});
    }
  });


  return BaseRoute;
});
