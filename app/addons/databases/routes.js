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
  "addons/databases/views"
],

function(app, FauxtonAPI, Databases, Views) {

  var AllDbsRouteObject = FauxtonAPI.RouteObject.extend({
    layout: "one_pane",

    crumbs: [
      {"name": "Databases", "link": "/_all_dbs"}
    ],

    routes: {
      "": "allDatabases",
      "index.html": "allDatabases",
      "_all_dbs(:params)": "allDatabases"
    },

    selectedHeader: "Databases",

    initialize: function() {
      this.databases = new Databases.List();
    },

    allDatabases: function() {
      var params = app.getParams(),
          dbPage = params.page;

      this.databasesView = this.setView("#dashboard-content", new Views.List({
        collection: this.databases
      }));

      this.rightHeader = this.setView("#api-navbar", new Views.RightAllDBsHeader({
        collection: this.databases,
        endpoint: this.databases.url("apiurl"),
        documentation: this.databases.documentation()
      }));

      this.databasesView.setPage(dbPage);
    },

    establish: function() {
     return [this.databases.fetchOnce()];
    }
  });

  Databases.RouteObjects = [AllDbsRouteObject];

  return Databases;
});
