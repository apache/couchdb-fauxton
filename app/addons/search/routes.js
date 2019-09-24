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
import FauxtonAPI from '../../core/api';
import Resources from './resources';
import SearchActions from './actions';
import DatabasesActions from '../databases/actions';
import Databases from '../databases/base';
import BaseRoute from '../documents/shared-routes';
import SidebarActions from '../documents/sidebar/actions';
import Actions from './actions';
import Layout from './layout';
import React from 'react';
import {SidebarItemSelection} from '../documents/sidebar/helpers';

var SearchRouteObject = BaseRoute.extend({
  routes: {
    'database/:database/_design/:ddoc/_search/:search(?*searchQuery)': {
      route: 'searchNoPartition',
      roles: ['fx_loggedIn']
    },
    'database/:database/_partition/:partitionkey/_design/:ddoc/_search/:search(?*searchQuery)': {
      route: 'search',
      roles: ['fx_loggedIn']
    },
    'database/:database/_design/:ddoc/_indexes/:search(?*searchQuery)': {
      route: 'searchNoPartition',
      roles: ['fx_loggedIn']
    },
    'database/:database/_partition/:partitionkey/_design/:ddoc/_indexes/:search(?*searchQuery)': {
      route: 'search',
      roles: ['fx_loggedIn']
    },
    'database/:database/_design/:ddoc/_search/:search/edit': {
      route: 'editNoPartition',
      roles: ['fx_loggedIn']
    },
    'database/:database/_partition/:partitionkey/_design/:ddoc/_search/:search/edit': {
      route: 'edit',
      roles: ['fx_loggedIn']
    },
    'database/:database/new_search': 'createNoPartition',
    'database/:database/_partition/:partitionkey/new_search': 'create',
    'database/:database/new_search/:designDoc': 'createNoPartition',
    'database/:database/_partition/:partitionkey/new_search/:designDoc': 'create'
  },

  initialize: function (route, options) {
    this.databaseName = options[0];
    this.database = new Databases.Model({ id: this.databaseName });
    this.data = {
      database: new Databases.Model({ id: this.databaseName })
    };

    this.data.designDocs = new Resources.AllDocs(null, {
      database: this.data.database,
      params: {
        startkey: '"_design"',
        endkey: '"_design1"',
        include_docs: true
      }
    });

    SidebarActions.dispatchNewOptions({
      database: this.data.database,
      designDocs: this.data.designDocs
    });
  },

  searchNoPartition: function (databaseName, ddocName, indexName, query) {
    return this.search(databaseName, '', ddocName, indexName, query);
  },

  search: function (databaseName, partitionKey, ddocName, indexName, query) {
    this.databaseName = databaseName;
    this.ddocName     = ddocName;
    this.indexName    = indexName;

    const selectedNavItem = new SidebarItemSelection('designDoc', {
      designDocName: ddocName,
      designDocSection: 'Search Indexes',
      indexName: indexName
    });
    SidebarActions.dispatchExpandSelectedItem(selectedNavItem);

    const dropDownLinks = this.getCrumbs(this.database);
    Actions.dispatchInitSearchIndex({
      databaseName: databaseName,
      partitionKey: partitionKey,
      designDoc: ddocName,
      indexName: indexName,
      query: query
    });
    DatabasesActions.fetchSelectedDatabaseInfo(databaseName);

    const encodedPartKey = partitionKey ? encodeURIComponent(partitionKey) : '';
    const endpointUrl = FauxtonAPI.urls('search', 'apiurl', this.databaseName, encodedPartKey, this.ddocName,
      this.indexName, (query ? query : '*:*'));

    const encodedQuery = query ? `?${encodeURIComponent(query)}` : '';
    const navigateToPartitionedView = (partKey) => {
      const baseUrl = FauxtonAPI.urls('partitioned_search', 'app', encodeURIComponent(databaseName),
        encodeURIComponent(partKey), encodeURIComponent(ddocName));
      FauxtonAPI.navigate('#/' + baseUrl + encodeURIComponent(indexName) + encodedQuery);
    };
    const navigateToGlobalView = () => {
      const baseUrl = FauxtonAPI.urls('search', 'app', encodeURIComponent(databaseName), encodeURIComponent(ddocName));
      FauxtonAPI.navigate('#/' + baseUrl + encodeURIComponent(indexName) + encodedQuery);
    };
    return <Layout
      section={'search'}
      dropDownLinks={dropDownLinks}
      endpoint={endpointUrl}
      docURL={FauxtonAPI.constants.DOC_URLS.SEARCH_INDEXES}
      database={this.database}
      indexName={indexName}
      selectedNavItem={selectedNavItem}
      partitionKey={partitionKey}
      onPartitionKeySelected={navigateToPartitionedView}
      onGlobalModeSelected={navigateToGlobalView}
      globalMode={partitionKey === ''}
    />;
  },

  editNoPartition: function (database, ddocName, indexName) {
    return this.edit(database, '', ddocName, indexName);
  },

  edit: function (database, partitionKey, ddocName, indexName) {
    const selectedNavItem = new SidebarItemSelection('designDoc', {
      designDocName: ddocName,
      designDocSection: 'Search Indexes',
      indexName: indexName
    });
    SidebarActions.dispatchExpandSelectedItem(selectedNavItem);

    SearchActions.dispatchEditSearchIndex({
      ddocID: '_design/' + ddocName,
      database: this.database,
      indexName: indexName,
      designDocs: this.data.designDocs
    });
    DatabasesActions.fetchSelectedDatabaseInfo(database);

    const dropDownLinks = this.getCrumbs(this.database);
    return <Layout
      section={'edit'}
      dropDownLinks={dropDownLinks}
      database={this.database}
      indexName={indexName}
      ddocName={ddocName}
      selectedNavItem={selectedNavItem}
      partitionKey={partitionKey}
    />;
  },

  createNoPartition: function (database, ddoc) {
    return this.create(database, '', ddoc);
  },

  create: function (database, partitionKey, ddoc) {
    const selectedNavItem = new SidebarItemSelection('');

    SearchActions.dispatchInitNewSearchIndex({
      database: this.database,
      designDocs: this.data.designDocs,
      defaultDDoc: ddoc,
    });
    DatabasesActions.fetchSelectedDatabaseInfo(database);

    const dropDownLinks = this.getCrumbs(this.database);
    return <Layout
      section={'create'}
      dropDownLinks={dropDownLinks}
      database={this.database}
      designDocs={this.data.designDocs}
      ddoc={ddoc}
      selectedNavItem={selectedNavItem}
      partitionKey={partitionKey}
    />;
  },

  getCrumbs: function (database) {
    return [
      { type: "back", link: "/_all_dbs"},
      { name: database.id }
    ];
  }
});

Resources.RouteObjects = [SearchRouteObject];

export default Resources;
