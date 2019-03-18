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

import React from 'react';
import FauxtonAPI from '../../core/api';
import BaseRoute from './shared-routes';
import DatabaseActions from '../databases/actions';
import Databases from '../databases/base';
import Resources from './resources';
import {SidebarItemSelection} from './sidebar/helpers';
import ComponentsActions from '../components/actions';
import {DocsTabsSidebarLayout, ViewsTabsSidebarLayout, ChangesSidebarLayout} from './layouts';

var DocumentsRouteObject = BaseRoute.extend({
  routes: {
    "database/:database/_partition/:partitionkey/_all_docs": {
      route: "partitionedAllDocs",
      roles: ["fx_loggedIn"]
    },
    "database/:database/_all_docs(:extra)": {
      route: "globalAllDocs",
      roles: ["fx_loggedIn"]
    },
    "database/:database/_partition/:partitionkey/_design/:ddoc/_info": {
      route: "designDocMetadata",
      roles: ['fx_loggedIn']
    },
    "database/:database/_design/:ddoc/_info": {
      route: "designDocMetadataNoPartition",
      roles: ['fx_loggedIn']
    },
    'database/:database/_partition/:partitionKey/_changes': {
      route: 'changes',
      roles: ['fx_loggedIn']
    },
    'database/:database/_changes': {
      route: 'changes',
      roles: ['fx_loggedIn']
    }
  },

  initialize (route, options) {
    this.initViews(options[0]);
  },

  initViews: function (dbName) {
    this.databaseName = dbName;
    this.database = new Databases.Model({id: this.databaseName});

    this.createDesignDocsCollection();

    this.addSidebar();
  },

  designDocMetadataNoPartition: function (database, ddoc) {
    return this.designDocMetadata(database, '', ddoc);
  },

  designDocMetadata: function (database, partitionKey, ddoc) {
    const designDocInfo = new Resources.DdocInfo({ _id: "_design/" + ddoc }, { database: this.database });
    const selectedNavItem = new SidebarItemSelection('designDoc', {
      designDocName: ddoc,
      designDocSection: 'metadata'
    });
    DatabaseActions.fetchSelectedDatabaseInfo(database);
    const dropDownLinks = this.getCrumbs(this.database);
    return <ViewsTabsSidebarLayout
      showEditView={false}
      docURL={designDocInfo.documentation()}
      endpoint={designDocInfo.url('apiurl')}
      dbName={this.database.id}
      dropDownLinks={dropDownLinks}
      database={this.database}
      selectedNavItem={selectedNavItem}
      designDocInfo={designDocInfo}
      partitionKey={partitionKey}
    />;
  },

  globalAllDocs: function (databaseName, options) {
    return this.allDocs(databaseName, '', options);
  },

  partitionedAllDocs: function (databaseName, partitionKey) {
    return this.allDocs(databaseName, partitionKey);
  },

  /*
  * docParams are the options fauxton uses to fetch from the server
  * urlParams are what are shown in the url and to the user
  * They are not the same when paginating
  */
  allDocs: function (databaseName, partitionKey, options) {
    const params = this.createParams(options);
    const docParams = params.docParams;

    const url = partitionKey ?
      FauxtonAPI.urls('partitioned_allDocs', 'server', encodeURIComponent(databaseName), encodeURIComponent(partitionKey)) :
      FauxtonAPI.urls('allDocsSanitized', 'server', databaseName);

    // this is used for the header and sidebar
    this.database.buildAllDocs(docParams);

    const onlyShowDdocs = !!(docParams.startkey && docParams.startkey.indexOf("_design") > -1);
    let tab = 'all-docs';
    if (onlyShowDdocs) {
      tab = 'design-docs';
    }

    const selectedNavItem = new SidebarItemSelection(tab);
    ComponentsActions.showDeleteDatabaseModal({showDeleteModal: false, dbId: ''});

    const endpoint = partitionKey ?
      FauxtonAPI.urls('partitioned_allDocs', 'apiurl', encodeURIComponent(databaseName), encodeURIComponent(partitionKey)) :
      this.database.allDocs.urlRef("apiurl", {});
    const docURL = FauxtonAPI.constants.DOC_URLS.GENERAL;
    const navigateToPartitionedAllDocs = (partKey) => {
      const baseUrl = FauxtonAPI.urls('partitioned_allDocs', 'app', encodeURIComponent(databaseName),
        encodeURIComponent(partKey));
      FauxtonAPI.navigate('#/' + baseUrl);
    };
    const navigateToGlobalAllDocs = () => {
      const baseUrl = FauxtonAPI.urls('allDocs', 'app', encodeURIComponent(databaseName));
      FauxtonAPI.navigate('#/' + baseUrl);
    };
    const dropDownLinks = this.getCrumbs(this.database);
    DatabaseActions.fetchSelectedDatabaseInfo(databaseName);
    return <DocsTabsSidebarLayout
      docURL={docURL}
      endpoint={endpoint}
      dbName={this.database.id}
      dropDownLinks={dropDownLinks}
      database={this.database}
      designDocs={this.designDocs}
      fetchUrl={url}
      ddocsOnly={onlyShowDdocs}
      selectedNavItem={selectedNavItem}
      partitionKey={partitionKey}
      onPartitionKeySelected={navigateToPartitionedAllDocs}
      onGlobalModeSelected={navigateToGlobalAllDocs}
      globalMode={partitionKey === ''}
    />;
  },

  changes: function (databaseName, partitionKey) {
    const selectedNavItem = new SidebarItemSelection('changes');
    DatabaseActions.fetchSelectedDatabaseInfo(databaseName);

    return <ChangesSidebarLayout
      endpoint={FauxtonAPI.urls('changes', 'apiurl', this.database.id, '')}
      docURL={this.database.documentation()}
      dbName={this.database.id}
      dropDownLinks={this.getCrumbs(this.database)}
      database={this.database}
      selectedNavItem={selectedNavItem}
      partitionKey={partitionKey}
    />;
  }

});

export default DocumentsRouteObject;
