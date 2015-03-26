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
  'addons/documents/views',
  'addons/documents/views-changes',
  'addons/documents/views-index',
  'addons/documents/views-doceditor',
  'addons/documents/views-mango',

  'addons/databases/base',
  'addons/documents/resources',
  'addons/fauxton/components',
  'addons/documents/pagination/stores',
  'addons/documents/index-results/actions'
],

function (app, FauxtonAPI, BaseRoute, Documents, Changes, Index, DocEditor, Mango,
  Databases, Resources, Components, PaginationStores, IndexResultsActions) {


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
        this.viewEditor && this.viewEditor.remove();

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

        this.viewEditor && this.viewEditor.remove();
        this.headerView && this.headerView.remove();


        if (!docParams) {
          docParams = {};
        }

        IndexResultsActions.newResultsList({
          collection: collection,
          isListDeletable: true,
          textEmptyIndex: 'No Document Created Yet!'
        });

        this.database.allDocs.paging.pageSize = PaginationStores.indexPaginationStore.getPerPage();

        this.resultList = this.setView('#dashboard-lower-content', new Index.ViewResultListReact({}));

        // this used to be a function that returned the object, but be warned: it caused a closure with a reference to
        // the initial this.database object which can change
        this.apiUrl = [this.database.allDocs.urlRef("apiurl", urlParams), this.database.allDocs.documentation()];

        // update the rightHeader with the latest & greatest info
        this.rightHeader.resetQueryOptions({ queryParams: urlParams });
        this.rightHeader.showQueryOptions();
      },

      reloadDesignDocs: function (event) {
        this.sidebar.forceRender();

        if (event && event.selectedTab) {
          this.sidebar.setSelectedTab(event.selectedTab);
        }
      },

      changes: function () {
        var docParams = app.getParams();
        this.database.buildChanges(docParams);

        this.changesView = this.setView("#dashboard-lower-content", new Changes.ChangesReactWrapper({
          model: this.database
        }));

        this.headerView = this.setView('#dashboard-upper-content', new Changes.ChangesHeaderReactWrapper());

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

      cleanup: function () {
        if (this.reactHeader) {
          this.removeView('#react-headerbar');
        }
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
        if (this.headerView) {
          this.removeView('#dashboard-upper-content');
        }

        // we're no longer interested in listening to the lookahead tray event on this route object
        this.stopListening(FauxtonAPI.Events, 'lookaheadTray:update', this.onSelectDatabase);
      }

    });

    return DocumentsRouteObject;
  });
