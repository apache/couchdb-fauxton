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
import ChangesActions from './changes/actions';
import Databases from '../databases/base';
import Resources from './resources';
import SidebarActions from './sidebar/actions';
import DesignDocInfoActions from './designdocinfo/actions';
import ComponentsActions from '../components/actions';
import {DocsTabsSidebarLayout, ViewsTabsSidebarLayout, ChangesSidebarLayout} from './layouts';

var DocumentsRouteObject = BaseRoute.extend({
  routes: {
    "database/:database/_all_docs(:extra)": {
      route: "allDocs",
      roles: ["fx_loggedIn"]
    },
    "database/:database/_design/:ddoc/_info": {
      route: "designDocMetadata",
      roles: ['fx_loggedIn']
    },
    'database/:database/_changes': 'changes'
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

  designDocMetadata: function (database, ddoc) {
    var designDocInfo = new Resources.DdocInfo({ _id: "_design/" + ddoc }, { database: this.database });
    DesignDocInfoActions.fetchDesignDocInfo({
      ddocName: ddoc,
      designDocInfo: designDocInfo
    });

    SidebarActions.selectNavItem('designDoc', {
      designDocName: ddoc,
      designDocSection: 'metadata'
    });

    const dropDownLinks = this.getCrumbs(this.database);
    return <ViewsTabsSidebarLayout
      showEditView={false}
      docURL={designDocInfo.documentation()}
      endpoint={designDocInfo.url('apiurl')}
      dbName={this.database.id}
      dropDownLinks={dropDownLinks}
      database={this.database}
    />;
  },

  /*
  * docParams are the options fauxton uses to fetch from the server
  * urlParams are what are shown in the url and to the user
  * They are not the same when paginating
  */
  allDocs: function (databaseName, options) {
    const params = this.createParams(options),
          docParams = params.docParams;

    const url = FauxtonAPI.urls('allDocsSanitized', 'server', databaseName);

    // this is used for the header and sidebar
    this.database.buildAllDocs(docParams);

    const onlyShowDdocs = !!(docParams.startkey && docParams.startkey.indexOf("_design") > -1);
    let tab = 'all-docs';
    if (onlyShowDdocs) {
      tab = 'design-docs';
    }

    const selectedNavItem = {
      navItem: tab
    };
    SidebarActions.selectNavItem(selectedNavItem.navItem);
    ComponentsActions.showDeleteDatabaseModal({showDeleteModal: false, dbId: ''});

    const endpoint = this.database.allDocs.urlRef("apiurl", {});
    const docURL = FauxtonAPI.constants.DOC_URLS.GENERAL;

    const dropDownLinks = this.getCrumbs(this.database);
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
    />;
  },

  changes: function () {
    ChangesActions.initChanges({
      databaseName: this.database.id
    });
    SidebarActions.selectNavItem('changes');

    return <ChangesSidebarLayout
      endpoint={FauxtonAPI.urls('changes', 'apiurl', this.database.id, '')}
      docURL={this.database.documentation()}
      dbName={this.database.id}
      dropDownLinks={this.getCrumbs(this.database)}
      database={this.database}
    />;
  }

});

export default DocumentsRouteObject;
