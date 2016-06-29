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

import app from '../../app';

import FauxtonAPI from '../../core/api';
import BaseRoute from './shared-routes';
import Documents from './resources';
import RightAllDocsHeader from './components/rightalldocsheader.react';
import Changes from './changes/components.react';
import ChangesActions from './changes/actions';
import Databases from '../databases/base';
import Resources from './resources';
import Components from '../fauxton/components';
import IndexResultStores from './index-results/stores';
import IndexResultsActions from './index-results/actions';
import IndexResultsComponents from './index-results/index-results.components.react';
import ReactPagination from './pagination/pagination.react';
import ReactHeader from './header/header.react';
import ReactActions from './header/header.actions';
import SidebarActions from './sidebar/actions';
import DesignDocInfoActions from './designdocinfo/actions';
import DesignDocInfoComponents from './designdocinfo/components.react';
import ComponentsActions from '../components/actions';
import QueryOptionsActions from './queryoptions/actions';

var DocumentsRouteObject = BaseRoute.extend({
  layout: "with_tabs_sidebar",
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

  events: {
    "route:reloadDesignDocs": "reloadDesignDocs"
  },

  initialize: function (route, masterLayout, options) {
    this.initViews(options[0]);
  },

  establish: function () {
    return [
      this.designDocs.fetch({ reset: true }),
      this.allDatabases.fetchOnce()
    ];
  },

  initViews: function (dbName) {
    this.databaseName = dbName;
    this.database = new Databases.Model({id: this.databaseName});
    this.allDatabases = this.getAllDatabases();

    this.createDesignDocsCollection();

    this.setComponent("#right-header", RightAllDocsHeader, {
      database: this.database
    });

    this.addLeftHeader();
    this.addSidebar();
  },

  designDocMetadata: function (database, ddoc) {
    this.removeComponent('#footer');
    this.removeComponent('#react-headerbar');
    this.removeComponent('#dashboard-upper-content');

    var designDocInfo = new Resources.DdocInfo({ _id: "_design/" + ddoc }, { database: this.database });
    DesignDocInfoActions.fetchDesignDocInfo({
      ddocName: ddoc,
      designDocInfo: designDocInfo
    });
    this.setComponent("#dashboard-lower-content", DesignDocInfoComponents.DesignDocInfo);

    SidebarActions.selectNavItem('designDoc', {
      designDocName: ddoc,
      designDocSection: 'metadata'
    });

    this.leftheader.updateCrumbs(this.getCrumbs(this.database));
    QueryOptionsActions.hideQueryOptions();

    this.apiUrl = [designDocInfo.url('apiurl'), designDocInfo.documentation()];
  },

  /*
  * docParams are the options collection uses to fetch from the server
  * urlParams are what are shown in the url and to the user
  * They are not the same when paginating
  */
  allDocs: function (databaseName, options) {
    var params = this.createParams(options),
        urlParams = params.urlParams,
        docParams = params.docParams,
        collection;

    this.setComponent('#react-headerbar', ReactHeader.BulkDocumentHeaderController, {showIncludeAllDocs: true});
    this.setComponent('#footer', ReactPagination.Footer);

    this.leftheader.updateCrumbs(this.getCrumbs(this.database));


    // includes_docs = true if you are visiting the _replicator/_users databases
    if (['_replicator', '_users'].indexOf(databaseName) > -1) {
      docParams.include_docs = true;
      urlParams = params.docParams;
      var updatedURL = FauxtonAPI.urls('allDocs', 'app', databaseName, '?' + $.param(urlParams));
      FauxtonAPI.navigate(updatedURL, {trigger: false, replace: true});
    }

    this.database.buildAllDocs(docParams);
    collection = this.database.allDocs;

    var tab = 'all-docs';
    if (docParams.startkey && docParams.startkey.indexOf("_design") > -1) {
      tab = 'design-docs';
    }

    SidebarActions.selectNavItem(tab);
    ComponentsActions.showDeleteDatabaseModal({showDeleteModal: false, dbId: ''});

    this.removeComponent('#dashboard-upper-content');

    if (!docParams) {
      docParams = {};
    }

    var frozenCollection = app.utils.localStorageGet('include_docs_bulkdocs');
    window.localStorage.removeItem('include_docs_bulkdocs');

    IndexResultsActions.newResultsList({
      collection: collection,
      textEmptyIndex: 'No Documents Found',
      bulkCollection: new Documents.BulkDeleteDocCollection(frozenCollection, { databaseId: this.database.safeID() }),
    });

    this.database.allDocs.paging.pageSize = IndexResultStores.indexResultsStore.getPerPage();

    this.setComponent('#dashboard-lower-content', IndexResultsComponents.List);

    // this used to be a function that returned the object, but be warned: it caused a closure with a reference to
    // the initial this.database object which can change
    this.apiUrl = [this.database.allDocs.urlRef("apiurl", urlParams), this.database.allDocs.documentation()];

    // update the query options with the latest & greatest info
    QueryOptionsActions.reset({queryParams: urlParams});
    QueryOptionsActions.showQueryOptions();
  },

  reloadDesignDocs: function (event) {
    this.addSidebar(); // this ensures the design docs get reloaded
    if (event && event.selectedTab) {
      SidebarActions.selectNavItem(event.selectedTab);
    }
  },

  changes: function () {
    ChangesActions.initChanges({
      databaseName: this.database.id
    });
    this.setComponent('#dashboard-upper-content', Changes.ChangesTabContent);
    this.setComponent("#dashboard-lower-content", Changes.ChangesController);

    this.removeComponent('#footer');
    this.removeComponent('#react-headerbar');

    this.viewEditor && this.viewEditor.remove();

    SidebarActions.selectNavItem('changes');
    this.leftheader.updateCrumbs(this.getCrumbs(this.database));
    QueryOptionsActions.hideQueryOptions();

    this.apiUrl = function () {
      return [FauxtonAPI.urls('changes', 'apiurl', this.database.id, ''), this.database.documentation()];
    };
  }

});

export default DocumentsRouteObject;
