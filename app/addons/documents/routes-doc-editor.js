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
  "app",

  "api",

  // Modules
  //views
  "addons/documents/views",
  "addons/documents/views-doceditor",
  "addons/databases/base"
],

function(app, FauxtonAPI, Documents, DocEditor, Databases) {

  var DocEditorRouteObject = FauxtonAPI.RouteObject.extend({
    layout: "one_pane",
    disableLoader: true,
    selectedHeader: "Databases",

    initialize: function(route, masterLayout, options) {
      this.databaseName = options[0];
      this.docID = options[1] || 'new';

      this.database = this.database || new Databases.Model({ id: this.databaseName });
      this.doc = new Documents.Doc({ _id: this.docID }, { database: this.database });
    },

    routes: {
      "database/:database/:doc/code_editor": "code_editor",
      "database/:database/:doc": "code_editor",
      "database/:database/_design/:ddoc" :"showDesignDoc"
    },

    events: {
      "route:reRenderDoc": "reRenderDoc",
      "route:duplicateDoc": "duplicateDoc"
    },

    crumbs: function() {
      return [
        {"name": this.database.id, "link": Databases.databaseUrl(this.database)},
        {"name": this.docID, "link": "#"}
      ];
    },

    code_editor: function (database, doc) {

      // if either the database or document just changed, we need to get the latest doc/db info
      if (this.databaseName !== database) {
        this.databaseName = database;
        this.database = new Databases.Model({ id: this.databaseName });
      }
      if (this.docID !== doc) {
        this.docID = doc;
        this.doc = new Documents.Doc({ _id: this.docID }, { database: this.database });
      }

      this.docView = this.setView("#dashboard-content", new DocEditor.CodeEditor({
        model: this.doc,
        database: this.database
      }));

    },

    showDesignDoc: function (database, ddoc) {
      this.code_editor(database, '_design/' + ddoc);
    },

    reRenderDoc: function () {
      this.docView.forceRender();
    },

    duplicateDoc: function (newId) {
      var doc = this.doc,
      docView = this.docView,
      database = this.database;
      this.docID = newId;

      doc.copy(newId).then(function () {
        doc.set({_id: newId});
        docView.forceRender();
        FauxtonAPI.navigate('/database/' + database.safeID() + '/' + app.utils.safeURLName(newId), {trigger: true});
        FauxtonAPI.addNotification({
          msg: "Document has been duplicated."
        });

      }, function (error) {
        var errorMsg = "Could not duplicate document, reason: " + error.responseText + ".";
        FauxtonAPI.addNotification({
          msg: errorMsg,
          type: "error"
        });
      });
    },

    apiUrl: function() {
      return [this.doc.url("apiurl"), this.doc.documentation()];
    }
  });

  var NewDocEditorRouteObject = DocEditorRouteObject.extend({
    initialize: function (route, masterLayout, options) {
      var databaseName = options[0];

      this.database = this.database || new Databases.Model({id: databaseName});
      this.doc = new Documents.NewDoc(null,{
        database: this.database
      });
    },

    crumbs: function() {
      return [
        {"name": this.database.id, "link": Databases.databaseUrl(this.database)},
        {"name": "New", "link": "#"}
      ];
    },
    routes: {
      "database/:database/new": "code_editor"
    },
    selectedHeader: "Databases"
  });

  
  return {
    NewDocEditorRouteObject: NewDocEditorRouteObject,
    DocEditorRouteObject: DocEditorRouteObject
  };
});

