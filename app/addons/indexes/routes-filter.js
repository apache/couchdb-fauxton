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
  "addons/indexes/resources"
],

function (app, FauxtonAPI, Databases, Views, Documents, Resources) {

  var FilterIndexes = FauxtonAPI.RouteObject.extend({
    layout: "two_pane",
    routes: {
      "database/:database/_design/:ddoc/_filters/:fn": {
        route: "tempFn",
        roles: ['_admin']
      },
      "database/:database/new_filter": "newFilterEditor",
      "database/:database/new_filter/:designDoc": "newFilterEditor"
    },
    newFilterEditor: function(){
      return false;
    },
    tempFn:  function(databaseName, ddoc, fn){
      this.setView("#dashboard-upper-content", new Documents.Views.temp({}));
      this.crumbs = function () {
        return [
          {"name": this.data.database.id, "link": Databases.databaseUrl(this.data.database)},
        ];
      };
    }
  });

  return FilterIndexes;
});
