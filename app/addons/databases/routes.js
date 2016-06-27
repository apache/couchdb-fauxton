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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import Databases from "./resources";
import Actions from "./actions";
import Components from "./components.react";

var AllDbsRouteObject = FauxtonAPI.RouteObject.extend({
  layout: 'one_pane',

  crumbs: [
    {"name": "Databases"}
  ],

  routes: {
    "": "allDatabases",
    "index.html": "allDatabases",
    "_all_dbs(:params)": "allDatabases"
  },

  roles: ['fx_loggedIn'],

  selectedHeader: "Databases",
  disableLoader: true,

  initialize: function () {
    this.databases = new Databases.List();
  },

  allDatabases: function () {
    Actions.init(this.databases);
    this.setComponent("#right-header", Components.RightDatabasesHeader);
    this.setComponent("#dashboard-content", Components.DatabasesController);
    this.setComponent("#footer", Components.DatabasePagination);
  },

  apiUrl: function () {
    return [this.databases.url("apiurl"), this.databases.documentation()];
  }
});
Databases.RouteObjects = [AllDbsRouteObject];

export default Databases;
