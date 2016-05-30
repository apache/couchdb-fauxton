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
import Components from "../fauxton/components";
import Documents from "./resources";
import Databases from "../databases/resources";
import QueryOptions from "./queryoptions/queryoptions.react";
import QueryActions from "./queryoptions/actions";
import JumpToDoc from "./jumptodoc.react";
import "../../../assets/js/plugins/prettify";

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
  },

  afterRender: function () {
    QueryOptions.render('#query-options');
    JumpToDoc.render('#header-search', this.database, this.database.allDocs);
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

Documents.Views = Views;

export default Documents;
