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
  "../../app",
  "../../core/api",
  // Modules
  "../documents/resources"
],

function (app, FauxtonAPI, Documents) {
  var Databases = FauxtonAPI.addon();

  Databases.DocLimit = 100;

  Databases.Model = FauxtonAPI.Model.extend({
    initialize: function (options) {
      this.status = new Databases.Status({
        database: this
      });
    },

    documentation: function () {
      return FauxtonAPI.constants.DOC_URLS.ALL_DBS;
    },

    buildAllDocs: function (params) {
      this.allDocs = new Documents.AllDocs(null, {
        database: this,
        params: params
      });

      return this.allDocs;
    },

    isNew: function () {
      // Databases are never new, to make Backbone do a PUT
      return false;
    },

    isSystemDatabase: function () {
      return app.utils.isSystemDatabase(this.id);
    },

    url: function (context) {
      if (context === "index") {
        return "/database/" + this.safeID() + "/_all_docs";
      } else if (context === "web-index") {
        return "#/database/" + this.safeID() + "/_all_docs?limit=" + Databases.DocLimit;
      } else if (context === "apiurl") {
        return window.location.origin + "/database/" + this.safeID() + "/_all_docs";
      } else if (context === "changes") {
        return FauxtonAPI.urls('changes', 'app', this.safeID(), '?descending=true&limit=100&include_docs=true');
      } else if (context === "changes-apiurl") {
        return FauxtonAPI.urls('changes', 'apiurl', this.safeID(), '?descending=true&limit=100&include_docs=true');
      } else if (context === "app") {
        return "/database/" + this.safeID();
      } else {
        return app.host + "/" + this.safeID();
      }
    },
    safeName: function () {
      return app.utils.safeURLName(this.get("name"));
    },
    safeID: function () {
      return app.utils.safeURLName(this.id);
    },
    buildChanges: function (params) {
      if (!params.limit) {
        params.limit = 100;
      }

      this.changes = new Databases.Changes({
        database: this,
        params: params
      });

      return this.changes;
    }
  });

  Databases.Changes = FauxtonAPI.Collection.extend({

    initialize: function (options) {
      this.database = options.database;
      this.params = options.params;
    },
    documentation: function () {
      return FauxtonAPI.constants.DOC_URLS.CHANGES;
    },
    url: function (context) {
      var query = "";
      if (this.params) {
        query = "?" + $.param(this.params);
      }

      if (!context) { context = 'server';}

      return FauxtonAPI.urls('changes', context, this.database.safeID(), query);
    },

    parse: function (resp) {
      this.last_seq = resp.last_seq;
      return resp.results;
    }
  });

  Databases.Status = FauxtonAPI.Model.extend({
    url: function () {
      return app.host + "/" + this.database.safeID();
    },

    initialize: function (options) {
      this.database = options.database;
      this.loadSuccess = false;
    },

    numDocs: function () {
      return this.get("doc_count");
    },

    numDeletedDocs: function () {
      return this.get("doc_del_count");
    },

    isGraveYard: function () {
      return this.numDeletedDocs() > this.numDocs();
    },

    updateSeq: function (full) {
      var updateSeq = this.get("update_seq");
      if (full || (typeof(updateSeq) === 'number')) {
        return updateSeq;
      } else if (updateSeq) {
        return updateSeq[0];
      } else {
        return 0;
      }
    },

    dataSize: function () {
      if (this.get("other")) {
        return this.get("other").data_size;
      } else if (this.get('data_size')) {
        return this.get('data_size');
      } else if (this.get('disk_size')) {
        return this.get('disk_size');
      } else {
        return 0;
      }
    },

    parse: function (resp) {
      this.loadSuccess = true;
      return resp;
    },

    // a sure-fire way to know when the DB size info is actually available; dataSize() may return 0 before or after
    // the data has been loaded
    hasDataSize: function () {
      return this.get('other') || this.get('data_size') || this.get('disk_size');
    }
  });

  // TODO: shared databases - read from the user doc
  Databases.List = FauxtonAPI.Collection.extend({
    model: Databases.Model,
    documentation: function () {
      return FauxtonAPI.constants.DOC_URLS.ALL_DBS;
    },

    getDatabaseNames: function () {
      return _.map(this.toArray(), function (model) {
        return model.get('name');
      });
    },

    cache: {
      expires: 60
    },

    url: function (context) {
      if (context === "apiurl") {
        return window.location.origin + "/_all_dbs";
      } else {
        return app.host + "/_all_dbs";
      }
    },

    parse: function (resp) {
      // TODO: pagination!
      return _.map(resp, function (database) {
        return {
          id: app.utils.safeURLName(database),
          name: database
        };
      });
    },

    paginated: function (page, perPage) {
      var start = (page - 1) * perPage;
      var end = page * perPage;
      return this.slice(start, end);
    }
  });

  return Databases;
});
