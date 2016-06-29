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
import Databases from "../databases/base";
import Components from "../fauxton/components";
import PaginationActions from "./pagination/actions";
import IndexResultStores from "./index-results/stores";
import SidebarComponents from "./sidebar/sidebar.react";
import SidebarActions from "./sidebar/actions";
import QueryActions from './queryoptions/actions';


// The Documents section is built up a lot of different route object which share code. This contains
// base functionality that can be used across routes / addons
var BaseRoute = FauxtonAPI.RouteObject.extend({
  layout: 'with_tabs_sidebar',
  selectedHeader: 'Databases',
  overrideBreadcrumbs: true,

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

  getAllDatabases: function () {
    return new Databases.List();  //getAllDatabases() can be overwritten instead of hard coded into initViews
  },

  showQueryOptions: function (urlParams, ddoc, viewName) {
    var promise = this.designDocs.fetch({reset: true}),
    that = this,
    hasReduceFunction;

    promise.then(function (resp) {
      var design = _.findWhere(that.designDocs.models, {id: '_design/' + ddoc});
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

  addLeftHeader: function () {
    this.leftheader = this.setView('#breadcrumbs', new Components.LeftHeader({
      databaseName: this.database.safeID(),
      crumbs: this.getCrumbs(this.database)
    }));
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
    this.setComponent("#sidebar-content", SidebarComponents.SidebarController);
  },

  getCrumbs: function (database) {
    return [
      { "type": "back", "link": FauxtonAPI.urls('allDBs', 'app')},
      { "name": database.id, className: "lookahead-tray-link" }
    ];
  },

  ddocInfo: function (designDoc, designDocs, view) {
    return {
      id: "_design/" + designDoc,
      currView: view,
      designDocs: designDocs
    };
  },

  createParams: function (options) {
    var urlParams = app.getParams(options),
        params = Documents.QueryParams.parse(urlParams);

    PaginationActions.setDocumentLimit(parseInt(urlParams.limit, 10));

    var limit = IndexResultStores.indexResultsStore.getPerPage();
    return {
      urlParams: urlParams,
      docParams: _.extend(params, {limit: limit})
    };
  }
});


export default BaseRoute;
