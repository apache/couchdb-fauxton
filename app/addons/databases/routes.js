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

import app from '../../app';
import React from 'react';
import FauxtonAPI from "../../core/api";
import Actions from "./actions";
import Databases from "./resources";
import Layout from './layout';

const AllDbsRouteObject = FauxtonAPI.RouteObject.extend({
  hideApiBar: true,
  hideNotificationCenter: true,

  routes: {
    "": "allDatabases",
    "index.html": "allDatabases",
    "_all_dbs(:extra)": "allDatabases"
  },

  roles: ['fx_loggedIn'],

  selectedHeader: "Databases",

  allDatabases: function (_, params) {
    const {page, limit} = this.createParams(params);
    Actions.setPage(page);
    if (limit) {
      Actions.setLimit(limit);
    }
    return <Layout />;
  },

  createParams: function (options) {
    let page = 1;
    let limit = undefined;
    if (options) {
      const urlParams = app.getParams(options);
      if (isFinite(parseInt(urlParams.page))) {
        page = parseInt(urlParams.page);
      }
      if (isFinite(parseInt(urlParams.limit))) {
        limit = parseInt(urlParams.limit);
      }
    }
    return {
      page,
      limit
    };
  }
});
Databases.RouteObjects = [AllDbsRouteObject];

export default Databases;
