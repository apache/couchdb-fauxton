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
import FauxtonAPI from "../../core/api";
import Documents from "./resources";
import Databases from "../databases/base";
import Actions from "./doc-editor/actions";
import DocEditorContainer from "./doc-editor/components/DocEditorContainer";
import RevBrowserContainer from './rev-browser/container';
import {DocEditorLayout} from '../components/layouts';


const DocEditorRouteObject = FauxtonAPI.RouteObject.extend({
  selectedHeader: 'Databases',

  roles: ['fx_loggedIn'],

  initialize (route, options) {
    this.databaseName = options[0];
    this.docId = options[1];
    this.database = this.database || new Databases.Model({ id: this.databaseName });
    this.doc = new Documents.NewDoc(null, { database: this.database });
  },

  routes: {
    'database/:database/:doc/conflicts': 'revisionBrowser',
    'database/:database/:doc/code_editor': 'codeEditor',
    'database/:database/_design/:ddoc/conflicts': 'revBrowserForDesignDoc',
    'database/:database/_design/:ddoc': 'showDesignDoc',
    'database/:database/_local/:doc': 'showLocalDoc',
    'database/:database/:doc': 'codeEditor',
    'database/:database/new': 'codeEditor'
  },

  revisionBrowser: function (databaseName, docId) {
    const backLink = FauxtonAPI.urls('allDocs', 'app', FauxtonAPI.url.encode(this.database.safeID()));
    const docURL = FauxtonAPI.urls('document', 'app', this.database.safeID(), this.docId);

    const crumbs = [
      { name: this.database.safeID(), link: backLink },
      { name: this.docId + ' > Conflicts' }
    ];

    return <DocEditorLayout
      crumbs={crumbs}
      endpoint={this.doc.url('apiurl')}
      docURL={docURL}
      component={<RevBrowserContainer docId={docId} databaseName={databaseName} />}
    />;
  },

  revBrowserForDesignDoc: function(databaseName, ddoc) {
    return this.revisionBrowser(databaseName, '_design/' + ddoc);
  },

  codeEditor: function (databaseName, docId) {
    const backLink = FauxtonAPI.urls('allDocs', 'app', FauxtonAPI.url.encode(databaseName));

    const crumbs =  [
      { name: databaseName, link: backLink },
      { name: docId ? docId : 'New Document' }
    ];

    this.database = new Databases.Model({ id: databaseName });

    if (docId) {
      this.doc = new Documents.Doc({ _id: docId }, { database: this.database, fetchConflicts: true });
    }

    Actions.dispatchInitDocEditor({ doc: this.doc, database: this.database });

    return <DocEditorLayout
      crumbs={crumbs}
      endpoint={this.doc.url('apiurl')}
      docURL={this.doc.documentation()}
      component={<DocEditorContainer
        database={this.database}
        isNewDoc={docId ? false : true}
      />}
    />;
  },

  showLocalDoc: function(databaseName, docId) {
    return this.codeEditor(databaseName, '_local/' + docId);
  },

  showDesignDoc: function (database, ddoc) {
    return this.codeEditor(database, '_design/' + ddoc);
  }
});


export default {
  DocEditorRouteObject: DocEditorRouteObject
};
