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
import Documents from "./shared-resources";
import SidebarActions from "./sidebar/actions";

// The Documents section is built up a lot of different route object which share code. This contains
// base functionality that can be used across routes / addons
var BaseRoute = FauxtonAPI.RouteObject.extend({
  selectedHeader: 'Databases',

  createDesignDocsCollection: function () {
    this.designDocs = new Documents.AllDocs(null, {
      database: this.database,
      paging: {
        pageSize: 500
      },
      params: {
        startkey: '_design/',
        endkey: '_design0',
        include_docs: true,
        limit: 500
      }
    });
  },

  addSidebar: function (selectedNavItem) {
    var options = {
      designDocs: this.designDocs,
      database: this.database
    };
    if (selectedNavItem) {
      options.selectedNavItem = selectedNavItem;
    }

    SidebarActions.dispatchNewOptions(options);
  },

  getCrumbs: function (database) {
    return [
      { "type": "back", "link": FauxtonAPI.urls('allDBs', 'app')},
      { "name": database.id }
    ];
  },

  createParams: function (options) {
    const urlParams = app.getParams(options),
          params = Documents.QueryParams.parse(urlParams);

    return {
      urlParams: urlParams,
      docParams: params
    };
  }
});


export default BaseRoute;
