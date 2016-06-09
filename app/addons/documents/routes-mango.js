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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import Helpers from "./helpers";
import BaseRoute from "./shared-routes";
import Databases from "../databases/resources";
import Components from "../fauxton/components";
import Resources from "./resources";
import IndexResultsActions from "./index-results/actions";
import IndexResultStores from "./index-results/stores";
import ReactHeader from "./header/header.react";
import ReactActions from "./header/header.actions";
import ReactPagination from "./pagination/pagination.react";
import MangoComponents from "./mango/mango.components.react";
import MangoActions from "./mango/mango.actions";
import MangoStores from "./mango/mango.stores";
import IndexResultsComponents from "./index-results/index-results.components.react";
import SidebarActions from "./sidebar/actions";
import RightAllDocsHeader from './components/rightalldocsheader.react';

var MangoIndexEditorAndQueryEditor = BaseRoute.extend({
  layout: 'two_pane',
  routes: {
    'database/:database/_index': {
      route: 'createIndex',
      roles: ['fx_loggedIn']
    },
    'database/:database/_find': {
      route: 'findUsingIndex',
      roles: ['fx_loggedIn']
    },
  },

  initialize: function (route, masterLayout, options) {
    var databaseName = options[0];
    this.databaseName = databaseName;
    this.database = new Databases.Model({id: databaseName});

    // magic methods
    this.allDatabases = this.getAllDatabases();
    this.createDesignDocsCollection();
    this.addLeftHeader();

    MangoActions.setDatabase({
      database: this.database
    });
  },

  findUsingIndex: function () {
    var params = this.createParams(),
        urlParams = params.urlParams,
        mangoResultCollection = new Resources.MangoDocumentCollection(null, {
          database: this.database,
          paging: {
            pageSize: IndexResultStores.indexResultsStore.getPerPage()
          }
        }),
        mangoIndexList = new Resources.MangoIndexCollection(null, {
          database: this.database,
          params: null,
          paging: {
            pageSize: IndexResultStores.indexResultsStore.getPerPage()
          }
        });

    SidebarActions.selectNavItem('mango-query');
    this.setComponent('#react-headerbar', ReactHeader.BulkDocumentHeaderController, {showIncludeAllDocs: false});
    this.setComponent('#footer', ReactPagination.Footer);

    IndexResultsActions.newMangoResultsList({
      collection: mangoResultCollection,
      textEmptyIndex: 'No Results',
      bulkCollection: new Resources.BulkDeleteDocCollection([], { databaseId: this.database.safeID() }),
    });

    MangoActions.getIndexList({
      indexList: mangoIndexList
    });

    var url = FauxtonAPI.urls('allDocs', 'app', this.database.safeID(), '?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT);
    this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
      toggleDisabled: true,
      crumbs: [
        {'type': 'back', 'link': url},
        {'name': app.i18n.en_US['mango-title-editor'], 'link': url}
      ]
    }));

    this.setComponent('#left-content', MangoComponents.MangoQueryEditorController, {
      description: app.i18n.en_US['mango-descripton'],
      editorTitle: app.i18n.en_US['mango-title-editor'],
      additionalIndexesText: app.i18n.en_US['mango-additional-indexes-heading']
    });
    this.setComponent('#dashboard-lower-content', IndexResultsComponents.List);

    this.apiUrl = function () {
      return [mangoResultCollection.urlRef('query-apiurl', urlParams), FauxtonAPI.constants.DOC_URLS.MANGO_SEARCH];
    };
  },

  createIndex: function (database) {
    var params = this.createParams(),
        urlParams = params.urlParams,
        mangoIndexCollection = new Resources.MangoIndexCollection(null, {
          database: this.database,
          params: null,
          paging: {
            pageSize: IndexResultStores.indexResultsStore.getPerPage()
          }
        });

    IndexResultsActions.newResultsList({
      collection: mangoIndexCollection,
      bulkCollection: new Resources.MangoBulkDeleteDocCollection([], { databaseId: this.database.safeID() }),
      typeOfIndex: 'mango'
    });

    var url = FauxtonAPI.urls('allDocs', 'app', this.database.safeID(), '?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT);
    this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
      toggleDisabled: true,
      crumbs: [
        {'type': 'back', 'link': url},
        {'name': app.i18n.en_US['mango-indexeditor-title'], 'link': url }
      ]
    }));

    this.setComponent('#react-headerbar', ReactHeader.BulkDocumentHeaderController, {showIncludeAllDocs: false});
    this.setComponent('#footer', ReactPagination.Footer);

    this.setComponent('#dashboard-lower-content', IndexResultsComponents.List);
    this.setComponent('#left-content', MangoComponents.MangoIndexEditorController, {
      description: app.i18n.en_US['mango-descripton-index-editor']
    });

    this.apiUrl = function () {
      return [mangoIndexCollection.urlRef('index-apiurl', urlParams), FauxtonAPI.constants.DOC_URLS.MANGO_INDEX];
    };
  }
});

export default {
  MangoIndexEditorAndQueryEditor: MangoIndexEditorAndQueryEditor
};
