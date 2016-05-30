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
  './helpers',
  './shared-routes',
  '../databases/resources',

  '../fauxton/components',
  './resources',
  './views',
  './index-results/actions',
  './index-results/stores',

  './header/header.react',
  './header/header.actions',
  './pagination/pagination.react',

  './mango/mango.components.react',
  './mango/mango.actions',
  './mango/mango.stores',
  './index-results/index-results.components.react',
  './sidebar/actions',
],


function (app, FauxtonAPI, Helpers, BaseRoute, Databases,
  Components, Resources, Documents, IndexResultsActions, IndexResultStores,
  ReactHeader, ReactActions, ReactPagination,
  MangoComponents, MangoActions, MangoStores, IndexResultsComponents, SidebarActions) {

  const MangoIndexEditorAndQueryEditor = BaseRoute.extend({
    layout: 'two_pane',
    routes: {
      'database/:database/_index': {
        route: 'createIndex',
        roles: ['fx_loggedIn']
      },
      'database/:database/_find': {
        route: 'findUsingIndex',
        roles: ['fx_loggedIn']
      },
      'database/:database/_query_builder': {
        route: 'buildQuery',
        roles: ['fx_loggedIn']
      },
    },

    initialize: function (route, masterLayout, options) {
      var databaseName = options[0];
      this.databaseName = databaseName;
      this.database = new Databases.Model({id: databaseName});

      // magic methods
      this.allDatabases = this.getAllDatabases();
      this.createDesignDocsCollection();
      this.addLeftHeader();

      MangoActions.setDatabase({
        database: this.database
      });
    },

    buildQuery: function (database) {
      const params = this.createParams();
      const urlParams = params.urlParams;
      const mangoResultCollection = new Resources.MangoDocumentCollection(null, {
        database: this.database,
        paging: {
          pageSize: IndexResultStores.indexResultsStore.getPerPage()
        }
      });

      const mangoIndexList = new Resources.MangoIndexCollection(null, {
        database: this.database,
        params: null,
        paging: {
          pageSize: IndexResultStores.indexResultsStore.getPerPage()
        }
      });

      SidebarActions.selectNavItem('mango-query');

      this.setComponent('#react-headerbar', ReactHeader.BulkDocumentHeaderController);
      this.setComponent('#footer', ReactPagination.Footer);

      IndexResultsActions.newMangoResultsList({
        collection: mangoResultCollection,
        textEmptyIndex: 'No Results',
        bulkCollection: Documents.BulkDeleteDocCollection
      });


      this.setComponent('#dashboard-lower-content', IndexResultsComponents.List);

      this.setComponent('#left-content', MangoComponents.MangoQueryBuilderController);

      this.apiUrl = () => {
        return [
          mangoResultCollection.urlRef('query-apiurl', ''),
          FauxtonAPI.constants.DOC_URLS.MANGO_SEARCH
        ];
      };
    },

    findUsingIndex: function () {
      var params = this.createParams(),
          urlParams = params.urlParams,
          mangoResultCollection = new Resources.MangoDocumentCollection(null, {
            database: this.database,
            paging: {
              pageSize: IndexResultStores.indexResultsStore.getPerPage()
            }
          }),
          mangoIndexList = new Resources.MangoIndexCollection(null, {
            database: this.database,
            params: null,
            paging: {
              pageSize: IndexResultStores.indexResultsStore.getPerPage()
            }
          });

      SidebarActions.selectNavItem('mango-query');
      this.setComponent('#react-headerbar', ReactHeader.BulkDocumentHeaderController, {showIncludeAllDocs: false});
      this.setComponent('#footer', ReactPagination.Footer);

      IndexResultsActions.newMangoResultsList({
        collection: mangoResultCollection,
        textEmptyIndex: 'No Results',
        bulkCollection: new Documents.BulkDeleteDocCollection([], { databaseId: this.database.safeID() }),
      });

      MangoActions.getIndexList({
        indexList: mangoIndexList
      });

      const url = FauxtonAPI.urls('allDocs', 'app', this.database.safeID(), '?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT);
      this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
        toggleDisabled: true,
        crumbs: [
          {'type': 'back', 'link': url},
          {'name': app.i18n.en_US['mango-title-editor'], 'link': url}
        ]
      }));

      this.setComponent('#left-content', MangoComponents.MangoQueryEditorController, {
        description: app.i18n.en_US['mango-descripton'],
        editorTitle: app.i18n.en_US['mango-title-editor'],
        additionalIndexesText: app.i18n.en_US['mango-additional-indexes-heading']
      });
      this.setComponent('#dashboard-lower-content', IndexResultsComponents.List);

      this.apiUrl = function () {
        return [mangoResultCollection.urlRef('query-apiurl', urlParams), FauxtonAPI.constants.DOC_URLS.MANGO_SEARCH];
      };
    },

    createIndex: function (database) {
      var params = this.createParams(),
          urlParams = params.urlParams,
          mangoIndexCollection = new Resources.MangoIndexCollection(null, {
            database: this.database,
            params: null,
            paging: {
              pageSize: IndexResultStores.indexResultsStore.getPerPage()
            }
          });

      IndexResultsActions.newResultsList({
        collection: mangoIndexCollection,
        bulkCollection: new Documents.MangoBulkDeleteDocCollection([], { databaseId: this.database.safeID() }),
        typeOfIndex: 'mango'
      });

      var url = FauxtonAPI.urls('allDocs', 'app', this.database.safeID(), '?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT);
      this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
        toggleDisabled: true,
        crumbs: [
          {'type': 'back', 'link': url},
          {'name': app.i18n.en_US['mango-indexeditor-title'], 'link': url }
        ]
      }));

      this.setComponent('#react-headerbar', ReactHeader.BulkDocumentHeaderController, {showIncludeAllDocs: false});
      this.setComponent('#footer', ReactPagination.Footer);

      this.setComponent('#dashboard-lower-content', IndexResultsComponents.List);
      this.setComponent('#left-content', MangoComponents.MangoIndexEditorController, {
        description: app.i18n.en_US['mango-descripton-index-editor']
      });

      this.apiUrl = function () {
        return [mangoIndexCollection.urlRef('index-apiurl', urlParams), FauxtonAPI.constants.DOC_URLS.MANGO_INDEX];
      };
    }
  });

  return {
    MangoIndexEditorAndQueryEditor: MangoIndexEditorAndQueryEditor
  };
});
