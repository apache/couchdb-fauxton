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
  "addons/databases/resources",
  // TODO:: fix the include flow modules so we don't have to require views here
  'addons/databases/views',
  'addons/fauxton/components'

],

function (app, FauxtonAPI, Databases, Views, Components) {

  var AllDbsRouteObject = FauxtonAPI.RouteObject.extend({
    layout: 'one_pane',

    crumbs: [
      {"name": "Databases", "link": "/_all_dbs"}
    ],

    routes: {
      "": "allDatabases",
      "index.html": "allDatabases",
      "_all_dbs(:params)": "allDatabases"
    },

    roles: ['fx_loggedIn'],

    selectedHeader: "Databases",

    initialize: function () {
      this.databases = new Databases.List();
    },

    allDatabases: function () {
      var params = app.getParams(),
          dbPage = params.page ? parseInt(params.page, 10) : 1,
          perPage = FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE,
          pagination;

      pagination = new Components.Pagination({
        page: dbPage,
        perPage: perPage,
        collection: this.databases,
        urlFun: function (page) {
          return '#/_all_dbs?page=' + page;
        }
      });

      this.footer = this.setView('#footer', new Views.Footer());
      this.setView('#database-pagination', pagination);

      this.databasesView = this.setView("#dashboard-content", new Views.List({
        collection: this.databases,
        perPage: perPage,
        page: dbPage
      }));

      this.rightHeader = this.setView("#right-header", new Views.RightAllDBsHeader({
        collection: this.databases,
      }));

      this.databasesView.setPage(dbPage);
    },

    apiUrl: function () {
      return [this.databases.url("apiurl"), this.databases.documentation()];
    },

    establish: function () {
      return [this.databases.fetch({ cache: false })];
    }
  });

  Databases.RouteObjects = [AllDbsRouteObject];

  return Databases;
});
