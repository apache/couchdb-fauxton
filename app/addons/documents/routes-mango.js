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
  'addons/documents/helpers',
  'addons/documents/shared-routes',
  'addons/documents/views-mango',
  'addons/databases/resources',
  'addons/fauxton/components',
  'addons/documents/resources',
  'addons/documents/views',


  'addons/documents/index-results/actions',
  'addons/documents/pagination/stores',

],

function (app, FauxtonAPI, Helpers, BaseRoute, Mango, Databases,
  Components, Resources, Documents, IndexResultsActions, PaginationStores) {

  var MangoIndexList = BaseRoute.extend({
    layout: 'with_tabs_sidebar',
    routes: {
      'database/:database/_indexlist(:extra)': {
        route: 'mangoIndexList',
        roles: ['fx_loggedIn']
      },

    },

    establish: function () {
      return [
        this.designDocs.fetch({reset: true}),
        this.allDatabases.fetchOnce()
      ];
    },

    initialize: function (route, masterLayout, options) {
      var databaseName = options[0];
      this.databaseName = databaseName;
      this.database = new Databases.Model({id: databaseName});

      // magic methods
      this.allDatabases = this.getAllDatabases();
      this.createDesignDocsCollection();
      this.addLeftHeader();
      this.addSidebar();

      this.rightHeader = this.setView('#right-header', new Documents.Views.RightAllDocsHeader({
        database: this.database
      }));
    },

    mangoIndexList: function () {
      var params = this.createParams(),
          urlParams = params.urlParams,
          mangoIndexCollection = new Resources.MangoIndexCollection(null, {
            database: this.database,
            params: null,
            paging: {
              pageSize: PaginationStores.indexPaginationStore.getPerPage()
            }
          });

      this.viewEditor && this.viewEditor.remove();
      this.headerView && this.headerView.remove();

      this.sidebar.setSelectedTab('mango-indexes');

      IndexResultsActions.newResultsList({
        collection: mangoIndexCollection,
        isListDeletable: false
      });

      this.reactHeader = this.setView('#react-headerbar', new Documents.Views.ReactHeaderbar());

      this.leftheader.updateCrumbs(this.getCrumbs(this.database));
      this.rightHeader.hideQueryOptions();

      this.resultList = this.setView('#dashboard-lower-content', new Mango.MangoIndexListReact());

      this.apiUrl = function () {
        return [mangoIndexCollection.urlRef(urlParams), FauxtonAPI.constants.DOC_URLS.GENERAL];
      };
    }
  });

  var MangoIndexEditorAndResults = BaseRoute.extend({
    layout: 'two_pane',
    routes: {
      'database/:database/_index': {
        route: 'createIndex',
        roles: ['fx_loggedIn']
      }
    },

    initialize: function (route, masterLayout, options) {
      var databaseName = options[0];

      this.databaseName = databaseName;
      this.database = new Databases.Model({id: databaseName});
    },

    createIndex: function (database) {
      var params = this.createParams(),
          urlParams = params.urlParams,
          mangoIndexCollection = new Resources.MangoIndexCollection(null, {
            database: this.database
          });

      IndexResultsActions.newResultsList({
        collection: mangoIndexCollection,
        isListDeletable: false
      });

      this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
        toggleDisabled: true,
        crumbs: [
          {'type': 'back', 'link': Helpers.getPreviousPage(this.database)},
          {'name': 'Create new index', 'link': Databases.databaseUrl(this.database) }
        ]
      }));

      this.resultList = this.setView('#dashboard-lower-content', new Mango.HelpScreen());

      this.mangoEditor = this.setView('#left-content', new Mango.MangoIndexEditorReact({
        database: this.database
      }));

      this.apiUrl = function () {
        return [mangoIndexCollection.urlRef(urlParams), FauxtonAPI.constants.DOC_URLS.GENERAL];
      };
    }
  });

  return {
    MangoIndexEditorAndResults: MangoIndexEditorAndResults,
    MangoIndexList: MangoIndexList
  };
});
