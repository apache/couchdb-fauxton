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
import Documents from "./shared-resources";
import SidebarActions from "./sidebar/actions";
import {MangoLayoutContainer} from './mangolayout';

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
  },

  findUsingIndex: function (database) {
    SidebarActions.selectNavItem('mango-query');

    const url = FauxtonAPI.urls(
      'allDocs', 'app', encodeURIComponent(this.databaseName), '?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT
    );

    const fetchUrl = '/' + encodeURIComponent(this.databaseName) + '/_find';

    const crumbs = [
      {name: database, link: url},
      {name: app.i18n.en_US['mango-title-editor']}
    ];

    const endpoint = FauxtonAPI.urls('mango', 'query-apiurl', encodeURIComponent(this.databaseName));

    return <MangoLayoutContainer
      database={database}
      crumbs={crumbs}
      docURL={FauxtonAPI.constants.DOC_URLS.MANGO_SEARCH}
      endpoint={endpoint}
      edit={false}

      databaseName={this.databaseName}
      fetchUrl={fetchUrl}
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

    const url = FauxtonAPI.urls(
      'allDocs', 'app', encodeURIComponent(this.databaseName), '?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT
    );
    const endpoint = FauxtonAPI.urls('mango', 'index-apiurl', encodeURIComponent(this.databaseName));

    const crumbs = [
      {name: database, link: url},
      {name: app.i18n.en_US['mango-indexeditor-title']}
    ];

    return <MangoLayoutContainer
      showIncludeAllDocs={false}
      crumbs={crumbs}
      docURL={FauxtonAPI.constants.DOC_URLS.MANGO_INDEX}
      endpoint={endpoint}
      edit={true}
      designDocs={designDocs}

      databaseName={this.databaseName}
    />;
  }
});

export default {
  MangoIndexEditorAndQueryEditor: MangoIndexEditorAndQueryEditor
};
