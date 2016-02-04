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

define([
  '../../app',
  '../../core/api',
  './helpers',
  './resources',
  '../databases/base',
  './doc-editor/actions',
  './doc-editor/components.react'
],

function (app, FauxtonAPI, Helpers, Documents, Databases, Actions, ReactComponents) {


  var DocEditorRouteObject = FauxtonAPI.RouteObject.extend({
    layout: 'doc_editor',
    disableLoader: true,
    selectedHeader: 'Databases',

    roles: ['fx_loggedIn'],

    initialize: function (route, masterLayout, options) {
      this.databaseName = options[0];
      this.docID = options[1] || 'new';
      this.database = this.database || new Databases.Model({ id: this.databaseName });
      this.doc = new Documents.Doc({ _id: this.docID }, { database: this.database });
      this.isNewDoc = false;
      this.wasCloned = false;
    },

    routes: {
      'database/:database/:doc/code_editor': 'codeEditor',
      'database/:database/:doc': 'codeEditor',
      'database/:database/_design/:ddoc': 'showDesignDoc'
    },

    events: {
      'route:duplicateDoc': 'duplicateDoc'
    },

    crumbs: function () {
      var previousPage = Helpers.getPreviousPageForDoc(this.database, this.wasCloned);

      return [
        { type: 'back', link: previousPage },
        { name: this.docID, link: '#' }
      ];
    },

    codeEditor: function (database, doc) {

      // if either the database or document just changed, we need to get the latest doc/db info
      if (this.databaseName !== database) {
        this.databaseName = database;
        this.database = new Databases.Model({ id: this.databaseName });
      }
      if (this.docID !== doc) {
        this.docID = doc;
        this.doc = new Documents.Doc({ _id: this.docID }, { database: this.database });
       }
      Actions.initDocEditor({ doc: this.doc, database: this.database });
      this.setComponent('#dashboard-content', ReactComponents.DocEditorController, {
        database: this.database,
        isNewDoc: this.isNewDoc,
        previousPage: '#/' + Helpers.getPreviousPageForDoc(this.database)
      });
    },

    showDesignDoc: function (database, ddoc) {
      this.codeEditor(database, '_design/' + ddoc);
    },

    duplicateDoc: function (newId) {
      var doc = this.doc,
          database = this.database;

      this.docID = newId;

      var that = this;
      doc.copy(newId).then(function () {
        doc.set({ _id: newId });
        that.wasCloned = true;

        FauxtonAPI.navigate('/database/' + database.safeID() + '/' + app.utils.safeURLName(newId), { trigger: true });
        FauxtonAPI.addNotification({
          msg: 'Document has been duplicated.'
        });

      }, function (error) {
        var errorMsg = 'Could not duplicate document, reason: ' + error.responseText + '.';
        FauxtonAPI.addNotification({
          msg: errorMsg,
          type: 'error'
        });
      });
    },

    apiUrl: function () {
      return [this.doc.url('apiurl'), this.doc.documentation()];
    }
  });


  var NewDocEditorRouteObject = DocEditorRouteObject.extend({
    initialize: function (route, masterLayout, options) {
      var databaseName = options[0];
      this.database = this.database || new Databases.Model({ id: databaseName });
      this.doc = new Documents.NewDoc(null, {
        database: this.database
      });
      this.isNewDoc = true;
      this.docID = null;
    },

    apiUrl: function () {
      return [this.doc.url('apiurl'), this.doc.documentation()];
    },

    crumbs: function () {
      var previousPage = Helpers.getPreviousPageForDoc(this.database);
      return [
        { type: 'back', link: previousPage },
        { name: 'New Document', link: '#' }
      ];
    },

    routes: {
      'database/:database/new': 'codeEditor'
    },

    selectedHeader: 'Databases'
  });


  return {
    NewDocEditorRouteObject: NewDocEditorRouteObject,
    DocEditorRouteObject: DocEditorRouteObject
  };

});
