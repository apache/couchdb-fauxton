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

    // document-list

    setDocPerPageLimit: function (perPage) {
      app.utils.localStorageSet('fauxton:perpage', perPage);
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

    ddocInfo: function (designDoc, designDocs, view) {
      return {
        id: "_design/" + designDoc,
        currView: view,
        designDocs: designDocs
      };
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

    createParams: function (options) {
      var urlParams = app.getParams(options),
          params = Documents.QueryParams.parse(urlParams),
          limit = this.getDocPerPageLimit(params, FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE);

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

      this.setDocPerPageLimit(perPage);
    },

    paginate: function (options) {
      var collection = this.documentsView.collection;
      this.documentsView.collection.reset(collection);

      this.documentsView.forceRender();
      this.allDocsNumber.forceRender();

      collection.paging.pageSize = options.perPage;
      var promise = collection[options.direction]({fetch: false});
    }
  });


  return BaseRoute;
});
