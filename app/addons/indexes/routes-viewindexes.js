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
  'addons/databases/base',
  'addons/indexes/views',
  'addons/documents/views',
  'addons/indexes/resources',
  'addons/indexes/routes-core',
  'addons/fauxton/components'
],

function (app, FauxtonAPI, Databases, Views, Documents, Resources, RouteCore, Components) {

  var ViewIndexes = RouteCore.extend({
    routes: {
      'database/:database/_design/:ddoc/_views/:view': {
        route: 'viewFn',
        roles: ['fx_loggedIn']
      },
      'database/:database/new_view': 'newViewEditor',
      'database/:database/new_view/:designDoc': 'newViewEditor'
    },

    newViewEditor: function (database, designDoc) {
      var params = app.getParams(),
          crumbs;
      /* --------------------------------------------------
        remove right header
      ----------------------------------------------------*/
      this.rightHeader && this.rightHeader.remove();

      /* --------------------------------------------------
        Insert Preview Screen View
      ----------------------------------------------------*/
      this.setView('#right-content', new Views.PreviewScreen({}));

      /* --------------------------------------------------
        Insert View Editor for new view
      ----------------------------------------------------*/
      this.viewEditor = this.setView('#left-content', new Views.ViewEditor({
        model: this.data.database,
        currentddoc: designDoc ? '_design/' + designDoc : '',
        ddocs: this.data.designDocs,
        params: params,
        database: this.data.database,
        newView: true
      }));

      crumbs = [
        {'name': '', 'className': 'fonticon-left-open', 'link': Databases.databaseUrl(this.data.database)},
        {'name': 'Create a View Index', 'link': Databases.databaseUrl(this.data.database)}
      ];
      this.leftheader = this.setView('#breadcrumbs', new Components.LeftHeader({
        crumbs: crumbs
      }));
    },

    viewFn: function (databaseName, ddoc, viewName) {
      var params = this.createParams(),
          urlParams = params.urlParams,
          docParams = params.docParams,
          decodeDdoc = decodeURIComponent(ddoc),
          cleanedViewName = viewName.replace(/\?.*$/, ''),
          crumbs,
          dropdown;

      /* --------------------------------------------------
        Set up breadcrumb header
      ----------------------------------------------------*/
      crumbs = [
        {'name': '', 'className': 'fonticon-left-open', 'link': Databases.databaseUrl(this.data.database)},
        {'name': cleanedViewName, 'link': Databases.databaseUrl(this.data.database)}
      ];

      dropdown = [{
        links: [
        {
          title: 'Delete',
          icon: 'fonticon-trash',
          trigger: 'index:delete'
        }]
      }];

      this.leftheader = this.setView('#breadcrumbs', new Components.LeftHeader({
        crumbs: crumbs,
        dropdownMenu: dropdown
      }));

      /* --------------------------------------------------
        Set up Index Collection
      ----------------------------------------------------*/
      this.data.indexedDocs = new Resources.IndexCollection(null, {
        database: this.data.database,
        design: decodeDdoc,
        view: cleanedViewName,
        params: docParams,
        paging: {
          pageSize: this.getDocPerPageLimit(urlParams, parseInt(docParams.limit, 10))
        }
      });

      /* --------------------------------------------------
        Insert View Editor
      ----------------------------------------------------*/
      this.viewEditor = this.setView('#left-content', new Views.ViewEditor({
        model: this.data.database,
        ddocs: this.data.designDocs,
        viewName: cleanedViewName,
        params: urlParams,
        newView: false,
        database: this.data.database,
        ddocInfo: this.ddocInfo(decodeDdoc, this.data.designDocs, cleanedViewName)
      }));

      /* --------------------------------------------------
        Insert Docs returned from view
      ----------------------------------------------------*/
      this.documentsView = this.createViewDocumentsView({
        designDoc: decodeDdoc,
        docParams: docParams,
        urlParams: urlParams,
        database: this.data.database,
        indexedDocs: this.data.indexedDocs,
        designDocs: this.data.designDocs,
        view: cleanedViewName
      });

      this.apiUrl = function() {
        return [this.data.indexedDocs.urlRef("apiurl", urlParams), "docs"];
      };

      this.rightHeader = this.setView("#right-header", new Documents.Views.RightAllDocsHeader({
        database: this.data.database
      }));

      this.rightHeader.showQueryOptions();
      this.rightHeader.resetQueryOptions({
        queryParams: urlParams,
        showStale: true,
        hasReduce: true,
        viewName: viewName,
        ddocName: ddoc
      });

    }
  });

  return ViewIndexes;
});
