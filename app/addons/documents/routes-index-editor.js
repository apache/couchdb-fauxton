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
  'app',
  'api',

  // Modules
  "addons/documents/helpers",
  'addons/documents/shared-routes',
  'addons/documents/views',
  'addons/documents/index-editor/components.react',
  'addons/documents/index-editor/actions',
  'addons/databases/base',
  'addons/fauxton/components',
  'addons/documents/pagination/stores',
  'addons/documents/index-results/actions',
  'addons/documents/index-results/index-results.components.react',
  'addons/documents/pagination/pagination.react'

],

function (app, FauxtonAPI, Helpers, BaseRoute, Documents, IndexEditorComponents, ActionsIndexEditor,
          Databases, Components, PaginationStores, IndexResultsActions,
          IndexResultsComponents, ReactPagination) {


  var IndexEditorAndResults = BaseRoute.extend({
    layout: 'two_pane',
    routes: {
      'database/:database/new_view': 'newViewEditor',
      'database/:database/new_view/:designDoc': 'newViewEditor',
      'database/:database/_design/:ddoc/_view/:view': {
        route: 'viewFn',
        roles: ['fx_loggedIn']
      }
    },

    initialize: function (route, masterLayout, options) {
      var databaseName = options[0];

      this.databaseName = databaseName;
      this.database = new Databases.Model({id: databaseName});
      this.allDatabases = new Databases.List();
      this.createDesignDocsCollection();
    },

    establish: function () {
      return [
        this.allDatabases.fetchOnce()
      ];
    },

    viewFn: function (databaseName, ddoc, viewName) {
      var params = this.createParams(),
          urlParams = params.urlParams,
          docParams = params.docParams,
          decodeDdoc = decodeURIComponent(ddoc);

      this.rightHeader = this.setView('#right-header', new Documents.Views.RightAllDocsHeader({
        database: this.database
      }));

      var url = FauxtonAPI.urls('allDocs', 'app', this.database.safeID(), '?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT);
      this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
        toggleDisabled: true,
        crumbs: [
          {'type': 'back', 'link': Helpers.getPreviousPage(this.database)},
          {'name': this.database.id, 'link': url }
        ]
      }));

      viewName = viewName.replace(/\?.*$/, '');

      this.setComponent('#footer', ReactPagination.Footer);

      this.indexedDocs = new Documents.IndexCollection(null, {
        database: this.database,
        design: decodeDdoc,
        view: viewName,
        params: docParams,
        paging: {
          pageSize: PaginationStores.indexPaginationStore.getPerPage()
        }
      });

      IndexResultsActions.newResultsList({
        collection: this.indexedDocs,
        isListDeletable: false,
        bulkCollection: Documents.BulkDeleteDocCollection
      });

      ActionsIndexEditor.fetchDesignDocsBeforeEdit({
        viewName: viewName,
        newView: false,
        database: this.database,
        designDocs: this.designDocs,
        designDocId: '_design/' + decodeDdoc
      });

      this.setComponent('#left-content', IndexEditorComponents.EditorController);
      this.setComponent('#dashboard-lower-content', IndexResultsComponents.List);

      this.apiUrl = function () {
        return [this.indexedDocs.urlRef(urlParams), FauxtonAPI.constants.DOC_URLS.GENERAL];
      };

      this.showQueryOptions(urlParams, ddoc, viewName);
    },

    newViewEditor: function (database, _designDoc) {
      var params = app.getParams();
      var newDesignDoc = true;
      var designDoc;

      if (_designDoc) {
        designDoc = '_design/' + _designDoc;
        newDesignDoc = false;
      }

      var url = FauxtonAPI.urls('allDocs', 'app', this.database.safeID(), '?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT);
      this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
        toggleDisabled: true,
        crumbs: [
          { type: 'back', link: Helpers.getPreviousPage(this.database) },
          { name: 'Create new index', link: url }
        ]
      }));

      ActionsIndexEditor.fetchDesignDocsBeforeEdit({
        viewName: 'new-view',
        newView: true,
        database: this.database,
        designDocs: this.designDocs,
        designDocId: designDoc,
        newDesignDoc: newDesignDoc
      });

      this.setComponent('#left-content', IndexEditorComponents.EditorController);
      this.setComponent('#dashboard-lower-content', IndexResultsComponents.List);

      IndexResultsActions.newResultsList({
        collection: [],
        isListDeletable: false,
        bulkCollection: Documents.BulkDeleteDocCollection
      });
    }

  });

  return IndexEditorAndResults;
});
