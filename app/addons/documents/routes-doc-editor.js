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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import Helpers from "./helpers";
import Documents from "./resources";
import Databases from "../databases/base";
import Actions from "./doc-editor/actions";
import ReactComponents from "./doc-editor/components.react";
import RevBrowserActions from "./rev-browser/rev-browser.actions";
import RevBrowserComponents from "./rev-browser/rev-browser.components.react";


const RevBrowserRouteObject = FauxtonAPI.RouteObject.extend({
  layout: 'doc_editor',
  disableLoader: true,
  selectedHeader: 'Databases',
  roles: ['fx_loggedIn'],

  routes: {
    'database/:database/:doc/conflicts': 'revisionBrowser'
  },

  initialize: function (route, masterLayout, options) {
    const databaseName = options[0];

    this.docId = options[1];
    this.database = this.database || new Databases.Model({ id: databaseName });
    this.doc = new Documents.Doc({ _id: this.docId }, { database: this.database });
  },

  crumbs: function () {
    const backLink = FauxtonAPI.urls('allDocs', 'app', this.database.safeID());
    const docUrl = FauxtonAPI.urls('document', 'app', this.database.safeID(), this.docId);

    return [
      { name: this.database.safeID(), link: backLink },
      { name: this.docId + ' > Conflicts' }
    ];
  },

  apiUrl: function () {
    return [this.doc.url('apiurl'), this.doc.documentation()];
  },

  revisionBrowser: function (databaseName, docId) {
    RevBrowserActions.showConfirmModal(false, null);
    RevBrowserActions.initDiffEditor(databaseName, docId);
    this.setComponent('#dashboard-content', RevBrowserComponents.DiffyController);
  }

});

const DocEditorRouteObject = FauxtonAPI.RouteObject.extend({
  layout: 'doc_editor',
  disableLoader: true,
  selectedHeader: 'Databases',

  roles: ['fx_loggedIn'],

  initialize: function (route, masterLayout, options) {
    this.databaseName = options[0];
    this.docId = options[1];
    this.database = this.database || new Databases.Model({ id: this.databaseName });
    this.doc = new Documents.NewDoc(null, { database: this.database });
  },

  routes: {
    'database/:database/:doc/code_editor': 'codeEditor',
    'database/:database/_design/:ddoc': 'showDesignDoc',
    'database/:database/:doc': 'codeEditor',
    'database/:database/new': 'codeEditor'
  },

  crumbs: function () {},

  codeEditor: function (databaseName, docId) {
    const backLink = FauxtonAPI.urls('allDocs', 'app', databaseName);

    this.crumbs =  [
      { name: databaseName, link: backLink },
      { name: docId ? docId : 'New Document' }
    ];

    this.database = new Databases.Model({ id: databaseName });

    if (docId) {
      this.doc = new Documents.Doc({ _id: docId }, { database: this.database, fetchConflicts: true });
    }

    Actions.initDocEditor({ doc: this.doc, database: this.database });
    this.setComponent('#dashboard-content', ReactComponents.DocEditorController, {
      database: this.database,
      isNewDoc: docId ? false : true
    });
  },

  showDesignDoc: function (database, ddoc) {
    this.codeEditor(database, '_design/' + ddoc);
  },

  apiUrl: function () {
    return [this.doc.url('apiurl'), this.doc.documentation()];
  }
});


export default {
  DocEditorRouteObject: DocEditorRouteObject,
  RevBrowserRouteObject: RevBrowserRouteObject
};
