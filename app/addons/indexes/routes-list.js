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
  "addons/databases/base",
  "addons/indexes/views",
  "addons/documents/views",
  "addons/indexes/resources",
  "addons/indexes/routes-core",
  "addons/fauxton/components"
],

function (app, FauxtonAPI, Databases, Views, Documents, Resources, RouteCore, Components) {

  var ListIndexes = RouteCore.extend({
    routes: {
      "database/:database/_design/:ddoc/_lists/:fn": {
        route: "tempFn",
        roles: ['_admin']
      },
      "database/:database/new_list": "newListsEditor",
      "database/:database/new_list/:designDoc": "newListsEditor"
    },

    apiUrl: function() {
      //TODO: Hook up proper API urls
      return '';
    },

    newListsEditor: function (database, designDoc) {
      var params = app.getParams();

      /* --------------------------------------------------
        Insert View Editor for new list
      ----------------------------------------------------*/
      this.setView("#left-content", new Views.ListEditor({
        model: this.data.database,
        currentddoc: designDoc ? "_design/"+designDoc : "",
        ddocs: this.data.designDocs,
        params: params,
        database: this.data.database,
        newView: true
      }));
      /* --------------------------------------------------
        Insert Preview Screen View
      ----------------------------------------------------*/
      this.setView("#right-content", new Views.PreviewScreen({}));

      /* --------------------------------------------------
        Set up & Insert breadcrumb header
      ----------------------------------------------------*/
      var crumbs = [
        {"name": "", "className": "fonticon-left-open", "link": Databases.databaseUrl(this.data.database)},
        {"name": "Create a List Index", "link": Databases.databaseUrl(this.data.database)}
      ];
      this.leftheader = this.setView("#breadcrumbs", new Components.LeftHeader({
        crumbs: crumbs
      }));
    },
    tempFn:  function(databaseName, ddoc, view){
      /* --------------------------------------------------
        Set up breadcrumb header
      ----------------------------------------------------*/
      var crumbs = [
        {"name": "", "className": "fonticon-left-open", "link": Databases.databaseUrl(this.data.database)},
        {"name": view, "link": Databases.databaseUrl(this.data.database)}
      ];

      var dropdown = [{
        links: [{
          title: 'Duplicate Index',
          icon: 'fonticon-documents'
        },{
          title: 'Delete',
          icon: 'fonticon-trash'
        }]
      }];

      this.leftheader = this.setView("#breadcrumbs", new Components.LeftHeader({
        crumbs: crumbs,
        dropdownMenu: dropdown
      }));


      /* --------------------------------------------------
        Insert List Editor
      ----------------------------------------------------*/
      this.setView("#left-content", new Views.ListEditor({}));

      /* --------------------------------------------------
        Insert Preview Screen View
      ----------------------------------------------------*/
      this.setView("#right-content", new Views.PreviewScreen({}));
    }
  });

  return ListIndexes;
});
