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
import FauxtonAPI from "../../core/api";
import BaseRoute from "./shared-routes";
import Documents from "./resources";
import ActionsIndexEditor from "./index-editor/actions";
import Databases from "../databases/base";
import IndexResultsStores from "./index-results/stores";
import IndexResultsActions from "./index-results/actions";
import SidebarActions from "./sidebar/actions";
import {DocsTabsSidebarLayout, ViewsTabsSidebarLayout} from './layouts';

const IndexEditorAndResults = BaseRoute.extend({
  routes: {
    'database/:database/new_view': {
      route: 'createView',
      roles: ['fx_loggedIn']
    },
    'database/:database/new_view/:designDoc': {
      route: 'createView',
      roles: ['fx_loggedIn']
    },
    'database/:database/_design/:ddoc/_view/:view': {
      route: 'showView',
      roles: ['fx_loggedIn']
    },
    'database/:database/_design/:ddoc/_view/:view/edit': {
      route: 'editView',
      roles: ['fx_loggedIn']
    }
  },

  initialize (route, options) {
    var databaseName = options[0];
    this.databaseName = databaseName;
    this.database = new Databases.Model({id: databaseName});
    this.createDesignDocsCollection();
    this.addSidebar();
  },

  showView: function (databaseName, ddoc, viewName) {
    var params = this.createParams(),
        urlParams = params.urlParams,
        docParams = params.docParams,
        decodeDdoc = decodeURIComponent(ddoc);

    viewName = viewName.replace(/\?.*$/, '');
    this.indexedDocs = new Documents.IndexCollection(null, {
      database: this.database,
      design: decodeDdoc,
      view: viewName,
      params: docParams,
      paging: {
        pageSize: IndexResultsStores.indexResultsStore.getPerPage()
      }
    });

    ActionsIndexEditor.clearIndex();

    IndexResultsActions.newResultsList({
      collection: this.indexedDocs,
      bulkCollection: new Documents.BulkDeleteDocCollection([], { databaseId: this.database.safeID() }),
    });

    ActionsIndexEditor.fetchDesignDocsBeforeEdit({
      viewName: viewName,
      newView: false,
      database: this.database,
      designDocs: this.designDocs,
      designDocId: '_design/' + decodeDdoc
    });

    SidebarActions.selectNavItem('designDoc', {
      designDocName: ddoc,
      designDocSection: 'Views',
      indexName: viewName
    });

    this.showQueryOptions(urlParams, ddoc, viewName);

    const endpoint = this.indexedDocs.urlRef('apiurl');
    const docURL = FauxtonAPI.constants.DOC_URLS.GENERAL;

    const dropDownLinks = this.getCrumbs(this.database);
    return <DocsTabsSidebarLayout
      showIncludeAllDocs={true}
      docURL={docURL}
      endpoint={endpoint}
      dbName={this.database.id}
      dropDownLinks={dropDownLinks}
      database={this.database}
      />;
  },

  createView: function (database, _designDoc) {
    var newDesignDoc = true;
    var designDoc = 'new-doc';

    if (_designDoc) {
      designDoc = '_design/' + _designDoc;
      newDesignDoc = false;
    }

    ActionsIndexEditor.fetchDesignDocsBeforeEdit({
      viewName: 'new-view',
      newView: true,
      database: this.database,
      designDocs: this.designDocs,
      designDocId: designDoc,
      newDesignDoc: newDesignDoc
    });

    SidebarActions.selectNavItem('');

    const dropDownLinks = this.getCrumbs(this.database);

    return <ViewsTabsSidebarLayout
      showIncludeAllDocs={true}
      docURL={FauxtonAPI.constants.DOC_URLS.GENERAL}
      dbName={this.database.id}
      dropDownLinks={dropDownLinks}
      database={this.database}
      />;
  },

  editView: function (databaseName, ddocName, viewName) {
    ActionsIndexEditor.fetchDesignDocsBeforeEdit({
      viewName: viewName,
      newView: false,
      database: this.database,
      designDocs: this.designDocs,
      designDocId: '_design/' + ddocName
    });

    SidebarActions.selectNavItem('designDoc', {
      designDocName: ddocName,
      designDocSection: 'Views',
      indexName: viewName
    });

    const docURL = FauxtonAPI.constants.DOC_URLS.GENERAL;
    const endpoint = FauxtonAPI.urls('view', 'apiurl', databaseName, ddocName, viewName);
    const dropDownLinks = this.getCrumbs(this.database);

    return <ViewsTabsSidebarLayout
      showIncludeAllDocs={true}
      docURL={docURL}
      endpoint={endpoint}
      dbName={this.database.id}
      dropDownLinks={dropDownLinks}
      database={this.database}
      />;
  }

});

export default IndexEditorAndResults;
