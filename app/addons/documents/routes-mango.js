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

import React from 'react';
import app from "../../app";
import FauxtonAPI from "../../core/api";
import Databases from "../databases/resources";
import Resources from "./resources";
import IndexResultsActions from "./index-results/actions";
import IndexResultStores from "./index-results/stores";
import PaginationActions from "./pagination/actions";
import Documents from "./shared-resources";
import MangoActions from "./mango/mango.actions";
import SidebarActions from "./sidebar/actions";
import {MangoLayout} from './mangolayout';

const MangoIndexEditorAndQueryEditor = FauxtonAPI.RouteObject.extend({
  selectedHeader: 'Databases',
  hideApiBar: true,
  hideNotificationCenter: true,
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

  initialize: function (route, options) {
    var databaseName = options[0];
    this.databaseName = databaseName;
    this.database = new Databases.Model({id: databaseName});

    MangoActions.setDatabase({
      database: this.database
    });
  },

  findUsingIndex: function (database) {
    PaginationActions.resetPagination();

    const pageSize = IndexResultStores.indexResultsStore.getPerPage();
    const mangoResultCollection = new Resources.MangoDocumentCollection(null, {
      database: this.database,
      params: {
        limit: pageSize
      },
      paging: {
        pageSize: pageSize
      }
    });

    const mangoIndexList = new Resources.MangoIndexCollection(null, {
      database: this.database,
      params: null,
      paging: {
        pageSize: pageSize
      }
    });

    SidebarActions.selectNavItem('mango-query');

    IndexResultsActions.newMangoResultsList({
      collection: mangoResultCollection,
      textEmptyIndex: 'No Results',
      typeOfIndex: 'mango',
      bulkCollection: new Resources.BulkDeleteDocCollection([], { databaseId: this.database.safeID() }),
    });

    MangoActions.getIndexList({
      indexList: mangoIndexList
    });

    const url = FauxtonAPI.urls(
      'allDocs', 'app', this.database.safeID(), '?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT
    );

    const crumbs = [
      {name: database, link: url},
      {name: app.i18n.en_US['mango-title-editor']}
    ];

    return <MangoLayout
      crumbs={crumbs}
      docURL={FauxtonAPI.constants.DOC_URLS.MANGO_SEARCH}
      endpoint={mangoResultCollection.urlRef('query-apiurl', '')}
      edit={false}
    />;
  },

  createIndex: function (database) {
    const designDocs = new Documents.AllDocs(null, {
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

    const mangoIndexCollection = new Resources.MangoIndexCollection(null, {
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

    const url = FauxtonAPI.urls(
      'allDocs', 'app', this.database.safeID(), '?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT
    );

    const crumbs = [
      {name: database, link: url},
      {name: app.i18n.en_US['mango-indexeditor-title']}
    ];

    return <MangoLayout
      showIncludeAllDocs={false}
      crumbs={crumbs}
      docURL={FauxtonAPI.constants.DOC_URLS.MANGO_INDEX}
      endpoint={mangoIndexCollection.urlRef('index-apiurl', '')}
      edit={true}
      designDocs={designDocs}
    />;
  }
});

export default {
  MangoIndexEditorAndQueryEditor: MangoIndexEditorAndQueryEditor
};
