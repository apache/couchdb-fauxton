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
import PaginationActions from "./pagination/actions";
import IndexResultStores from "./index-results/stores";
import SidebarActions from "./sidebar/actions";
import QueryActions from './queryoptions/actions';

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

  showQueryOptions: function (urlParams, ddoc, viewName) {
    var promise = this.designDocs.fetch({reset: true}),
        hasReduceFunction;

    promise.then(() => {
      var design = _.findWhere(this.designDocs.models, {id: '_design/' + ddoc});
      !_.isUndefined(hasReduceFunction = design.attributes.doc.views[viewName].reduce);

      QueryActions.showQueryOptions();
      QueryActions.reset({
        queryParams: urlParams,
        hasReduce: hasReduceFunction,
        showReduce: !_.isUndefined(hasReduceFunction),
        viewName: viewName,
        ddocName: ddoc
      });
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

    SidebarActions.newOptions(options);
  },

  getCrumbs: function (database) {
    return [
      { "type": "back", "link": FauxtonAPI.urls('allDBs', 'app')},
      { "name": database.id }
    ];
  },

  createParams: function (options) {
    const urlParams = app.getParams(options),
          params = Documents.QueryParams.parse(urlParams),
          store = IndexResultStores.indexResultsStore;

    let start = 0;
    if (urlParams.skip && store.hasCachedOffset()) {
      start = Math.max(store.getCachedOffset(), parseInt(urlParams.skip, 10));
    } else if (urlParams.skip) {
      start = parseInt(urlParams.skip, 10);
    } else if (store.hasCachedOffset()) {
      start = store.getCachedOffset();
    }
    PaginationActions.setPageStart(start);
    PaginationActions.setDocumentLimit(parseInt(urlParams.limit, 10));

    return {
      urlParams: urlParams,
      docParams: _.extend(params, {limit: store.getPerPage()})
    };
  }
});


export default BaseRoute;
