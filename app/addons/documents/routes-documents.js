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
  'addons/fauxton/memory',

  // Modules
  'addons/documents/shared-routes',
  'addons/documents/views',
  'addons/documents/changes/components.react',
  'addons/documents/changes/actions',
  'addons/documents/views-doceditor',
  'addons/documents/views-mango',

  'addons/databases/base',
  'addons/documents/resources',
  'addons/fauxton/components',
  'addons/documents/pagination/actions',
  'addons/documents/pagination/stores',
  'addons/documents/index-results/actions',
  'addons/documents/index-results/index-results.components.react'
],

function (app, FauxtonAPI, memory, BaseRoute, Documents, Changes, ChangesActions, DocEditor, Mango,
  Databases, Resources, Components, PaginationActions, PaginationStores, IndexResultsActions, IndexResultsComponents) {


    var DocumentsRouteObject = BaseRoute.extend({
      layout: "with_tabs_sidebar",
      routes: {
        "database/:database/_all_docs(:extra)": {
          route: "allDocs",
          roles: ["fx_loggedIn"]
        },
        "database/:database/_design/:ddoc/_info": {
          route: "designDocMetadata",
          roles: ['fx_loggedIn']
        },
        'database/:database/_changes': 'changes'
      },

      events: {
        "route:reloadDesignDocs": "reloadDesignDocs"
      },

      initialize: function (route, masterLayout, options) {
        this.initViews(options[0]);
        this.listenToLookaheadTray();
        this.once('afterEstablish', this.onEstablish);
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
        this.allDatabases = this.getAllDatabases();

        this.createDesignDocsCollection();

        this.rightHeader = this.setView("#right-header", new Documents.Views.RightAllDocsHeader({
          database: this.database
        }));

        this.addLeftHeader();
        this.addSidebar();
      },

      designDocMetadata: function (database, ddoc) {
        this.footer && this.footer.remove();
        this.toolsView && this.toolsView.remove();

        this.removeComponent('#dashboard-upper-content');

        var designDocInfo = new Resources.DdocInfo({ _id: "_design/" + ddoc }, { database: this.database });
        this.setView("#dashboard-lower-content", new Documents.Views.DdocInfo({
          ddocName: ddoc,
          model: designDocInfo
        }));

        this.sidebar.setSelectedTab(app.utils.removeSpecialCharacters(ddoc) + "_metadata");
        this.leftheader.updateCrumbs(this.getCrumbs(this.database));
        this.rightHeader.hideQueryOptions();

        this.apiUrl = [designDocInfo.url('apiurl'), designDocInfo.documentation()];
      },

      /*
      * docParams are the options collection uses to fetch from the server
      * urlParams are what are shown in the url and to the user
      * They are not the same when paginating
      */
      allDocs: function (databaseName, options) {
        var params = this.createParams(options),
          urlParams = params.urlParams,
          docParams = params.docParams,
          collection;

        if (this.eventAllDocs) {
          this.eventAllDocs = false;
          return;
        }

        // if we want to return the user to a specific page, set the appropriate value
        var page = 1;
        if (memory.get(FauxtonAPI.constants.MEMORY.RETURN_TO_LAST_RESULTS_PAGE) === true) {
          var key = FauxtonAPI.constants.MEMORY.RESULTS_PAGE_PREFIX + this.database.id;
          if (memory.has(key)) {
            page = memory.get(key);
          }
        }
        docParams.skip = (page - 1) * docParams.limit;

        this.reactHeader = this.setView('#react-headerbar', new Documents.Views.ReactHeaderbar());

        this.footer = this.setView('#footer', new Documents.Views.Footer());

        this.leftheader.updateCrumbs(this.getCrumbs(this.database));

        this.database.buildAllDocs(docParams);
        collection = this.database.allDocs;

        if (docParams.startkey && docParams.startkey.indexOf("_design") > -1) {
          this.sidebar.setSelectedTab("design-docs");
        } else {
          this.sidebar.setSelectedTab("all-docs");
        }

        this.removeComponent('#dashboard-upper-content');

        IndexResultsActions.newResultsList({
          collection: collection,
          isListDeletable: true,
          textEmptyIndex: 'No Document Created Yet!'
        });

        PaginationActions.setPage(page);
        this.database.allDocs.paging.pageSize = PaginationStores.indexPaginationStore.getPerPage();
        this.setComponent('#dashboard-lower-content', IndexResultsComponents.List);

        // this used to be a function that returned the object, but be warned: it caused a closure with a reference to
        // the initial this.database object which can change
        this.apiUrl = [this.database.allDocs.urlRef("apiurl", urlParams), this.database.allDocs.documentation()];

        // update the rightHeader with the latest & greatest info
        this.rightHeader.resetQueryOptions({ queryParams: urlParams });
        this.rightHeader.showQueryOptions();
      },

      // this runs on the establish event because we need the initial route layout to have been added to the page
      onEstablish: function () {
        // return the height of the scrollable region to where-ever the user was last
        if (memory.get(FauxtonAPI.constants.MEMORY.RETURN_TO_LAST_RESULTS_PAGE) === true) {
          this.getScrollableRegion().scrollTop(memory.get(FauxtonAPI.constants.MEMORY.RESULTS_PAGE_SCROLLTOP));
          memory.clear(FauxtonAPI.constants.MEMORY.RESULTS_PAGE_SCROLLTOP);
          memory.clear(FauxtonAPI.constants.MEMORY.RETURN_TO_LAST_RESULTS_PAGE);
        }
      },

      reloadDesignDocs: function (event) {
        this.sidebar.forceRender();

        if (event && event.selectedTab) {
          this.sidebar.setSelectedTab(event.selectedTab);
        }
      },

      changes: function () {
        ChangesActions.initChanges({
          databaseName: this.database.id
        });
        this.setComponent('#dashboard-upper-content', Changes.ChangesHeaderController);
        this.setComponent("#dashboard-lower-content", Changes.ChangesController);

        this.footer && this.footer.remove();
        this.toolsView && this.toolsView.remove();
        this.viewEditor && this.viewEditor.remove();
        this.reactHeader && this.reactHeader.remove();

        this.sidebar.setSelectedTab('changes');
        this.leftheader.updateCrumbs(this.getCrumbs(this.database));
        this.rightHeader.hideQueryOptions();

        this.apiUrl = function () {
          return [FauxtonAPI.urls('changes', 'apiurl', this.database.id, ''), this.database.documentation()];
        };
      },

      getScrollableRegion: function () {
        return $('#dashboard-content>div.scrollable');
      },

      cleanup: function () {

        // store the last scroll height for the scrollable region
        memory.set(FauxtonAPI.constants.MEMORY.RESULTS_PAGE_SCROLLTOP, this.getScrollableRegion().scrollTop());

        // to ensure garbage collection on the React components
        this.removeComponent('#dashboard-lower-content');

        // we're no longer interested in listening to the lookahead tray event on this route object
        this.stopListening(FauxtonAPI.Events, 'lookaheadTray:update', this.onSelectDatabase);
        FauxtonAPI.RouteObject.prototype.cleanup.apply(this);
      }
    });

    return DocumentsRouteObject;
  });
