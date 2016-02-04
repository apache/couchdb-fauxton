// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

define([
  '../../app',
  '../../core/api',

  // Modules
  "./helpers",
  './shared-routes',
  './views',
  './index-editor/components.react',
  './index-editor/actions',
  '../databases/base',
  '../fauxton/components',
  './index-results/stores',
  './index-results/actions',
  './index-results/index-results.components.react',
  './pagination/pagination.react',
  './header/header.react',
  './header/header.actions',
  './sidebar/actions'
],

function (app, FauxtonAPI, Helpers, BaseRoute, Documents, IndexEditorComponents, ActionsIndexEditor,
          Databases, Components, IndexResultsStores, IndexResultsActions,
          IndexResultsComponents, ReactPagination, ReactHeader, ReactHeaderActions, SidebarActions) {


  var IndexEditorAndResults = BaseRoute.extend({
    layout: 'with_tabs_sidebar',
    routes: {
      'database/:database/new_view': {
        route: 'createView',
        roles: ['fx_loggedIn']
      },
      'database/:database/new_view/:designDoc': {
        route: 'createView',
        roles: ['fx_loggedIn']
      },
      'database/:database/_design/:ddoc/_view/:view': {
        route: 'showView',
        roles: ['fx_loggedIn']
      },
      'database/:database/_design/:ddoc/_view/:view/edit': {
        route: 'editView',
        roles: ['fx_loggedIn']
      }
    },

    initialize: function (route, masterLayout, options) {
      var databaseName = options[0];
      this.databaseName = databaseName;
      this.database = new Databases.Model({id: databaseName});
      this.allDatabases = new Databases.List();
      this.createDesignDocsCollection();
      this.addLeftHeader();
      this.addSidebar();
    },

    establish: function () {
      return [
        this.designDocs.fetch({ reset: true }),
        this.allDatabases.fetchOnce()
      ];
    },

    showView: function (databaseName, ddoc, viewName) {
      var params = this.createParams(),
          urlParams = params.urlParams,
          docParams = params.docParams,
          decodeDdoc = decodeURIComponent(ddoc);

      this.rightHeader = this.setView('#right-header', new Documents.Views.RightAllDocsHeader({
        database: this.database
      }));

      viewName = viewName.replace(/\?.*$/, '');
      this.setComponent('#footer', ReactPagination.Footer);

      this.indexedDocs = new Documents.IndexCollection(null, {
        database: this.database,
        design: decodeDdoc,
        view: viewName,
        params: docParams,
        paging: {
          pageSize: IndexResultsStores.indexResultsStore.getPerPage()
        }
      });

      ActionsIndexEditor.clearIndex();

      IndexResultsActions.newResultsList({
        collection: this.indexedDocs,
        bulkCollection: new Documents.BulkDeleteDocCollection([], { databaseId: this.database.safeID() }),
      });

      ActionsIndexEditor.fetchDesignDocsBeforeEdit({
        viewName: viewName,
        newView: false,
        database: this.database,
        designDocs: this.designDocs,
        designDocId: '_design/' + decodeDdoc
      });

      SidebarActions.selectNavItem('designDoc', {
        designDocName: ddoc,
        designDocSection: 'Views',
        indexName: viewName
      });

      this.setComponent('#react-headerbar', ReactHeader.BulkDocumentHeaderController, {showIncludeAllDocs: true});
      this.setComponent('#dashboard-lower-content', IndexResultsComponents.List);

      this.apiUrl = function () {
        return [this.indexedDocs.urlRef('apiurl'), FauxtonAPI.constants.DOC_URLS.GENERAL];
      };

      this.showQueryOptions(urlParams, ddoc, viewName);
    },

    createView: function (database, _designDoc) {
      var newDesignDoc = true;
      var designDoc = 'new-doc';

      if (_designDoc) {
        designDoc = '_design/' + _designDoc;
        newDesignDoc = false;
      }

      ActionsIndexEditor.fetchDesignDocsBeforeEdit({
        viewName: 'new-view',
        newView: true,
        database: this.database,
        designDocs: this.designDocs,
        designDocId: designDoc,
        newDesignDoc: newDesignDoc
      });

      this.removeComponent('#react-headerbar');
      this.removeComponent('#footer');
      this.setComponent('#dashboard-lower-content', IndexEditorComponents.EditorController);
      SidebarActions.selectNavItem('');
    },

    editView: function (databaseName, ddocName, viewName) {
      ActionsIndexEditor.fetchDesignDocsBeforeEdit({
        viewName: viewName,
        newView: false,
        database: this.database,
        designDocs: this.designDocs,
        designDocId: '_design/' + ddocName
      });

      SidebarActions.selectNavItem('designDoc', {
        designDocName: ddocName,
        designDocSection: 'Views',
        indexName: viewName
      });

      this.apiUrl = function () {
        return [FauxtonAPI.urls('view', 'apiurl', databaseName, ddocName, viewName), FauxtonAPI.constants.DOC_URLS.GENERAL];
      };

      this.removeView('#right-header');
      this.removeComponent('#react-headerbar');
      this.removeComponent('#footer');
      this.setComponent('#dashboard-lower-content', IndexEditorComponents.EditorController);
    }

  });

  return IndexEditorAndResults;
});
