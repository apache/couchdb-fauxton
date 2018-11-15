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
import app from '../../app';
import FauxtonAPI from '../../core/api';
import Databases from '../databases/resources';
import DatabaseActions from '../databases/actions';
import Documents from './shared-resources';
import {MangoLayoutContainer} from './mangolayout';

const MangoIndexEditorAndQueryEditor = FauxtonAPI.RouteObject.extend({
  selectedHeader: 'Databases',
  hideApiBar: true,
  hideNotificationCenter: true,
  routes: {
    'database/:database/_partition/:partitionkey/_index': {
      route: 'createIndex',
      roles: ['fx_loggedIn']
    },
    'database/:database/_index': {
      route: 'createIndexNoPartition',
      roles: ['fx_loggedIn']
    },
    'database/:database/_partition/:partitionkey/_find': {
      route: 'findUsingIndex',
      roles: ['fx_loggedIn']
    },
    'database/:database/_find': {
      route: 'findUsingIndexNoPartition',
      roles: ['fx_loggedIn']
    },
  },

  initialize: function (route, options) {
    var databaseName = options[0];
    this.databaseName = databaseName;
    this.database = new Databases.Model({id: databaseName});
  },

  findUsingIndexNoPartition: function (database) {
    return this.findUsingIndex(database, '');
  },

  findUsingIndex: function (database, partitionKey) {
    const encodedPartitionKey = partitionKey ? encodeURIComponent(partitionKey) : '';
    const url = FauxtonAPI.urls(
      'allDocs', 'app', encodeURIComponent(this.databaseName), encodedPartitionKey
    );

    const partKeyUrlComponent = partitionKey ? `/${encodedPartitionKey}` : '';
    const fetchUrl = '/' + encodeURIComponent(this.databaseName) + partKeyUrlComponent + '/_find';

    const crumbs = [
      {name: database, link: url},
      {name: app.i18n.en_US['mango-title-editor']}
    ];

    const endpoint = FauxtonAPI.urls('mango', 'query-apiurl', encodeURIComponent(this.databaseName), encodedPartitionKey);

    const navigateToPartitionedView = (partKey) => {
      const baseUrl = FauxtonAPI.urls('mango', 'query-app', encodeURIComponent(database),
        encodeURIComponent(partKey));
      FauxtonAPI.navigate('#/' + baseUrl);
    };
    const navigateToGlobalView = () => {
      const baseUrl = FauxtonAPI.urls('mango', 'query-app', encodeURIComponent(database));
      FauxtonAPI.navigate('#/' + baseUrl);
    };

    return <MangoLayoutContainer
      database={database}
      crumbs={crumbs}
      docURL={FauxtonAPI.constants.DOC_URLS.MANGO_SEARCH}
      endpoint={endpoint}
      edit={false}
      databaseName={this.databaseName}
      fetchUrl={fetchUrl}
      partitionKey={partitionKey}
      onPartitionKeySelected={navigateToPartitionedView}
      onGlobalModeSelected={navigateToGlobalView}
      globalMode={partitionKey === ''}
    />;
  },

  createIndexNoPartition: function (database) {
    return this.createIndex(database, '');
  },

  createIndex: function (database, partitionKey) {
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

    const encodedPartitionKey = partitionKey ? encodeURIComponent(partitionKey) : '';
    const url = FauxtonAPI.urls(
      'allDocs', 'app', encodeURIComponent(this.databaseName), encodedPartitionKey
    );
    const endpoint = FauxtonAPI.urls('mango', 'index-apiurl', encodeURIComponent(this.databaseName), encodedPartitionKey);

    const crumbs = [
      {name: database, link: url},
      {name: app.i18n.en_US['mango-indexeditor-title']}
    ];

    DatabaseActions.fetchSelectedDatabaseInfo(database);

    return <MangoLayoutContainer
      showIncludeAllDocs={false}
      crumbs={crumbs}
      docURL={FauxtonAPI.constants.DOC_URLS.MANGO_INDEX}
      endpoint={endpoint}
      edit={true}
      designDocs={designDocs}
      databaseName={this.databaseName}
      partitionKey={partitionKey}
    />;
  }
});

export default {
  MangoIndexEditorAndQueryEditor: MangoIndexEditorAndQueryEditor
};
