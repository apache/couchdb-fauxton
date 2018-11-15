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
import ActionsIndexEditor from "./index-editor/actions";
import DatabaseActions from '../databases/actions';
import Databases from "../databases/base";
import SidebarActions from './sidebar/actions';
import {SidebarItemSelection} from './sidebar/helpers';
import {DocsTabsSidebarLayout, ViewsTabsSidebarLayout} from './layouts';

const IndexEditorAndResults = BaseRoute.extend({
  routes: {
    'database/:database/_partition/:partitionkey/new_view': {
      route: 'createView',
      roles: ['fx_loggedIn']
    },
    'database/:database/_partition/:partitionkey/new_view/:designDoc': {
      route: 'createView',
      roles: ['fx_loggedIn']
    },
    'database/:database/new_view': {
      route: 'createViewNoPartition',
      roles: ['fx_loggedIn']
    },
    'database/:database/new_view/:designDoc': {
      route: 'createViewNoPartition',
      roles: ['fx_loggedIn']
    },
    'database/:database/_partition/:partitionkey/_design/:ddoc/_view/:view': {
      route: 'showPartitionedView',
      roles: ['fx_loggedIn']
    },
    'database/:database/_design/:ddoc/_view/:view': {
      route: 'showGlobalView',
      roles: ['fx_loggedIn']
    },
    'database/:database/_partition/:partitionkey/_design/:ddoc/_view/:view/edit': {
      route: 'editView',
      roles: ['fx_loggedIn']
    },
    'database/:database/_design/:ddoc/_view/:view/edit': {
      route: 'editViewNoPartition',
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

  showGlobalView: function (databaseName, ddoc, viewName) {
    return this.showView(databaseName, '', ddoc, viewName);
  },

  showPartitionedView: function (databaseName, partitionKey, ddoc, viewName) {
    return this.showView(databaseName, partitionKey, ddoc, viewName);
  },

  showView: function (databaseName, partitionKey, ddoc, viewName) {
    viewName = viewName.replace(/\?.*$/, '');

    ActionsIndexEditor.dispatchClearIndex();
    ActionsIndexEditor.dispatchFetchDesignDocsBeforeEdit({
      viewName: viewName,
      isNewView: false,
      database: this.database,
      designDocs: this.designDocs,
      designDocId: '_design/' + ddoc
    });
    DatabaseActions.fetchSelectedDatabaseInfo(databaseName);

    const selectedNavItem = new SidebarItemSelection('designDoc', {
      designDocName: ddoc,
      designDocSection: 'Views',
      indexName: viewName
    });
    SidebarActions.dispatchExpandSelectedItem(selectedNavItem);

    const encodedPartKey = partitionKey ? encodeURIComponent(partitionKey) : '';
    const url = FauxtonAPI.urls('view', 'server', encodeURIComponent(databaseName), encodedPartKey,
      encodeURIComponent(ddoc), encodeURIComponent(viewName));
    const endpoint = FauxtonAPI.urls('view', 'apiurl', encodeURIComponent(databaseName), encodedPartKey,
      encodeURIComponent(ddoc), encodeURIComponent(viewName));
    const docURL = FauxtonAPI.constants.DOC_URLS.GENERAL;
    const navigateToPartitionedView = (partKey) => {
      const baseUrl = FauxtonAPI.urls('partitioned_view', 'app', encodeURIComponent(databaseName),
        encodeURIComponent(partKey), encodeURIComponent(ddoc));
      FauxtonAPI.navigate('#/' + baseUrl + encodeURIComponent(viewName));
    };
    const navigateToGlobalView = () => {
      const baseUrl = FauxtonAPI.urls('view', 'app', encodeURIComponent(databaseName), encodeURIComponent(ddoc));
      FauxtonAPI.navigate('#/' + baseUrl + encodeURIComponent(viewName));
    };
    const dropDownLinks = this.getCrumbs(this.database);
    return <DocsTabsSidebarLayout
      docURL={docURL}
      endpoint={endpoint}
      dbName={this.database.id}
      dropDownLinks={dropDownLinks}
      database={this.database}
      fetchUrl={url}
      ddocsOnly={false}
      deleteEnabled={false}
      selectedNavItem={selectedNavItem}
      partitionKey={partitionKey}
      onPartitionKeySelected={navigateToPartitionedView}
      onGlobalModeSelected={navigateToGlobalView}
      globalMode={partitionKey === ''}
    />;
  },

  createViewNoPartition: function (databaseName, _designDoc) {
    return this.createView(databaseName, '', _designDoc);
  },

  createView: function (database, partitionKey, _designDoc) {
    let isNewDesignDoc = true;
    let designDoc = 'new-doc';

    if (_designDoc) {
      designDoc = '_design/' + _designDoc;
      isNewDesignDoc = false;
    }

    ActionsIndexEditor.dispatchFetchDesignDocsBeforeEdit({
      viewName: 'new-view',
      isNewView: true,
      database: this.database,
      designDocs: this.designDocs,
      designDocId: designDoc,
      isNewDesignDoc: isNewDesignDoc
    });
    DatabaseActions.fetchSelectedDatabaseInfo(database);

    const selectedNavItem = new SidebarItemSelection('');
    const dropDownLinks = this.getCrumbs(this.database);

    return <ViewsTabsSidebarLayout
      showIncludeAllDocs={true}
      docURL={FauxtonAPI.constants.DOC_URLS.GENERAL}
      dbName={this.database.id}
      dropDownLinks={dropDownLinks}
      database={this.database}
      selectedNavItem={selectedNavItem}
      partitionKey={partitionKey}
    />;
  },

  editViewNoPartition: function (databaseName, ddocName, viewName) {
    return this.editView(databaseName, '', ddocName, viewName);
  },

  editView: function (databaseName, partitionKey, ddocName, viewName) {
    ActionsIndexEditor.dispatchFetchDesignDocsBeforeEdit({
      viewName: viewName,
      isNewView: false,
      database: this.database,
      designDocs: this.designDocs,
      designDocId: '_design/' + ddocName
    });
    DatabaseActions.fetchSelectedDatabaseInfo(databaseName);

    const selectedNavItem = new SidebarItemSelection('designDoc', {
      designDocName: ddocName,
      designDocSection: 'Views',
      indexName: viewName
    });
    SidebarActions.dispatchExpandSelectedItem(selectedNavItem);

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
      selectedNavItem={selectedNavItem}
      partitionKey={partitionKey}
    />;
  }

});

export default IndexEditorAndResults;
