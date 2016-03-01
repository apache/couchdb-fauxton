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
  "addons/fauxton/components",
  "addons/documents/resources",
  "addons/databases/resources",

  // Views
  "addons/documents/queryoptions/queryoptions.react",
  "addons/documents/queryoptions/actions",

  //plugins
  "plugins/prettify"
],

function (app, FauxtonAPI, Components, Documents, Databases, QueryOptions, QueryActions) {

  var Views = {};

  function showError (msg) {
    FauxtonAPI.addNotification({
      msg: msg,
      type: 'error',
      clear:  true
    });
  }

  Views.RightAllDocsHeader = FauxtonAPI.View.extend({
    className: "header-right right-db-header flex-layout flex-row",
    template: "addons/documents/templates/all_docs_header",
    events: {
      'click .toggle-select-menu': 'selectAllMenu'
    },

    initialize: function (options) {
      this.database = options.database;
      this.params = options.params;

      _.bindAll(this);
      this.selectVisible = false;
      FauxtonAPI.Events.on('success:bulkDelete', this.selectAllMenu);

      // insert the Search Docs field
      this.headerSearch = this.insertView("#header-search", new Views.JumpToDoc({
        database: this.database,
        collection: this.database.allDocs
      }));
    },

    afterRender: function () {
      QueryOptions.render('#query-options');
      this.toggleQueryOptionsHeader(this.isHidden);
    },

    cleanup: function () {
      FauxtonAPI.Events.unbind('success:bulkDelete');
    },

    selectAllMenu: function (e) {
      FauxtonAPI.triggerRouteEvent("toggleSelectHeader");
      FauxtonAPI.Events.trigger("documents:showSelectAll", this.selectVisible);
    },

    resetQueryOptions: function (options) {
      QueryActions.reset(options);
    },

    hideQueryOptions: function () {
      this.isHidden = true;
      if (this.hasRendered) {
        this.toggleQueryOptionsHeader(this.isHidden);
      }
    },

    showQueryOptions: function () {
      this.isHidden = false;
      if (this.hasRendered) {
        this.toggleQueryOptionsHeader(this.isHidden);
      }
    },

    toggleQueryOptionsHeader: function (hide) {
      $("#header-query-options").toggleClass("hide", hide);
    },

    serialize: function () {
      return {
        database: this.database.get('id')
      };
    }
  });

  Views.JumpToDoc = FauxtonAPI.View.extend({
    template: "addons/documents/templates/jumpdoc",

    initialize: function (options) {
      this.database = options.database;
    },

    events: {
      "submit #jump-to-doc": "jumpToDoc"
    },

    jumpToDoc: function (event) {
      event.preventDefault();
      var docId = this.$('#jump-to-doc-id').val().trim();
      var url = FauxtonAPI.urls('document', 'app', app.utils.safeURLName(this.database.id), app.utils.safeURLName(docId) );
      FauxtonAPI.navigate(url, {trigger: true});
    },

    afterRender: function () {
      this.typeAhead = new Components.DocSearchTypeahead({el: '#jump-to-doc-id', database: this.database});
      this.typeAhead.render();
    }
  });

  Documents.Views = Views;

  return Documents;
});
