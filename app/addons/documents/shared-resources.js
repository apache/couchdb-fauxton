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
  'app',
  'api',
  'cloudant.pagingcollection'
], function (app, FauxtonAPI, PagingCollection) {

  // defined here because this is contains the base resources used throughout the addon and outside,
  // so it's the first code that gets run
  var Documents = FauxtonAPI.addon();


  Documents.Doc = FauxtonAPI.Model.extend({
    idAttribute: "_id",
    documentation: function(){
      return FauxtonAPI.constants.DOC_URLS.GENERAL;
    },
    url: function(context) {
      if (context === "app") {
        return this.getDatabase().url("app") + "/" + this.safeID();
      } else if (context === "web-index") {
        return this.getDatabase().url("app") + "/" + app.utils.safeURLName(this.id);
      } else if (context === "apiurl"){
        return window.location.origin + "/" + this.getDatabase().safeID() + "/" + this.safeID();
      } else {
        return app.host + "/" + this.getDatabase().safeID() + "/" + this.safeID();
      }
    },

    initialize: function(_attrs, options) {
      if (this.collection && this.collection.database) {
        this.database = this.collection.database;
      } else if (options.database) {
        this.database = options.database;
      }
    },

    // HACK: the doc needs to know about the database, but it may be
    // set directly or indirectly in all docs
    getDatabase: function() {
      return this.database ? this.database : this.collection.database;
    },

    validate: function(attrs, options) {
      if (this.id && this.id !== attrs._id && this.get('_rev') ) {
        return "Cannot change a documents id.";
      }
    },

    docType: function() {
      return this.id && this.id.match(/^_design\//) ? "design doc" : "doc";
    },

    isEditable: function() {
      return this.docType() != "reduction";
    },

    isFromView: function(){
      return !this.id;
    },

    isReducedShown : function () {
      if (this.collection) {
        return this.collection.params.reduce;
      } else {
        return false;
      }
    },

    isDdoc: function() {
      return this.docType() === "design doc";
    },

    hasViews: function() {
      if (!this.isDdoc()) return false;
      var doc = this.get('doc');
      if (doc) {
        return doc && doc.views && _.keys(doc.views).length > 0;
      }

      var views = this.get('views');
      return views && _.keys(views).length > 0;
    },

    hasAttachments: function () {
      return !!this.get('_attachments');
    },

    getDdocView: function(view) {
      if (!this.isDdoc() || !this.hasViews()) return false;

      var doc = this.get('doc');
      if (doc) {
        return doc.views[view];
      }

      return this.get('views')[view];
    },

    setDdocView: function (view, map, reduce) {
      if (!this.isDdoc()) return false;
      var views = this.get('views'),
        tempView = views[view] || {};

      if (reduce) {
        tempView.reduce=reduce;
      } else {
        delete tempView.reduce;
      }
      tempView.map= map;

      views[view] = tempView;
      this.set({views: views});

      return true;
    },

    removeDdocView: function (viewName) {
      if (!this.isDdoc()) return false;
      var views = this.get('views');

      delete views[viewName];
      this.set({views: views});
    },

    dDocModel: function () {
      if (!this.isDdoc()) return false;
      var doc = this.get('doc');

      if (doc) {
        return new Documents.Doc(doc, {database: this.database});
      }

      return this;
    },

    viewHasReduce: function(viewName) {
      var view = this.getDdocView(viewName);

      return view && view.reduce;
    },

    // Need this to work around backbone router thinking _design/foo
    // is a separate route. Alternatively, maybe these should be
    // treated separately. For instance, we could default into the
    // json editor for docs, or into a ddoc specific page.
    safeID: function() {
      if (this.isDdoc()){
        var ddoc = this.id.replace(/^_design\//,"");
        return "_design/"+app.utils.safeURLName(ddoc);
      }else{
        return app.utils.safeURLName(this.id);
      }
    },

    destroy: function() {
      var url = this.url() + "?rev=" + this.get('_rev');
      return $.ajax({
        url: url,
        dataType: 'json',
        type: 'DELETE'
      });
    },

    parse: function(resp) {
      if (resp.rev) {
        resp._rev = resp.rev;
        delete resp.rev;
      }
      if (resp.id) {
        if (_.isUndefined(this.id)) {
          resp._id = resp.id;
        }
      }

      if (resp.ok) {
        delete resp.id;
        delete resp.ok;
      }

      return resp;
    },

    prettyJSON: function() {
      var data = this.get("doc") ? this.get("doc") : this.attributes;

      return JSON.stringify(data, null, "  ");
    },

    copy: function (copyId) {
      return $.ajax({
        type: 'COPY',
        url: '/' + this.database.safeID() + '/' + this.safeID(),
        headers: {Destination: copyId}
      });
    },

    isNewDoc: function () {
      return this.get('_rev') ? false : true;
    }
  });


  Documents.AllDocs = PagingCollection.extend({
    model: Documents.Doc,
    documentation: function () {
      return FauxtonAPI.constants.DOC_URLS.GENERAL;
    },
    initialize: function(_models, options) {
      this.viewMeta = options.viewMeta;
      this.database = options.database;
      this.params = _.clone(options.params);

      this.on("remove",this.decrementTotalRows , this);
      this.perPageLimit = options.perPageLimit || 20;

      if (!this.params.limit) {
        this.params.limit = this.perPageLimit;
      }
    },

    urlRef: function(context, params) {
      var query = "";

      if (params) {
        if (!_.isEmpty(params)) {
          query = "?" + $.param(params);
        } else {
          query = '';
        }
      } else if (this.params) {
        query = "?" + $.param(this.params);
      }

      if (context === 'app') {
        return 'database/' + this.database.safeID() + "/_all_docs" + query;
      } else if (context === "apiurl"){
        return window.location.origin + "/" + this.database.safeID() + "/_all_docs" + query;
      } else {
        return app.host + "/" + this.database.safeID() + "/_all_docs" + query;
      }
    },

    url: function () {
      return this.urlRef.apply(this, arguments);
    },

    simple: function () {
      var docs = this.map(function (item) {
        return {
          _id: item.id,
          _rev: item.get('_rev'),
        };
      });

      return new Documents.AllDocs(docs, {
        database: this.database,
        params: this.params
      });
    },

    totalRows: function() {
      return this.viewMeta.total_rows || "unknown";
    },

    decrementTotalRows: function () {
      if (this.viewMeta.total_rows) {
        this.viewMeta.total_rows = this.viewMeta.total_rows -1;
        this.trigger('totalRows:decrement');
      }
    },

    updateSeq: function() {
      return this.viewMeta.update_seq || false;
    },

    parse: function(resp) {
      var rows = resp.rows;

      // remove any query errors that may return without doc info
      // important for when querying keys on all docs
      var cleanRows = _.filter(rows, function(row){
        return row.value;
      });

      resp.rows = _.map(cleanRows, function(row){
        return {
          _id: row.id,
          _rev: row.value.rev,
          value: row.value,
          key: row.key,
          doc: row.doc || undefined
        };
      });

      return PagingCollection.prototype.parse.call(this, resp);
    },

    clone: function () {
      return new this.constructor(this.models, {
        database: this.database,
        params: this.params,
        paging: this.paging
      });
    }
  });

  return Documents;
});
