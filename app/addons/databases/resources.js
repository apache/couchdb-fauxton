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
import Helpers from "../../helpers";
import FauxtonAPI from "../../core/api";
import Documents from "../documents/resources";
var Databases = FauxtonAPI.addon();

Databases.DocLimit = 100;

Databases.Model = FauxtonAPI.Model.extend({

  partitioned: false,

  setPartitioned: function (partitioned) {
    this.partitioned = partitioned;
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
      return Helpers.getApiUrl("/database/" + this.safeID() + "/_all_docs");
    } else if (context === "changes") {
      return FauxtonAPI.urls('changes', 'app', this.safeID(), '', '?descending=true&limit=100&include_docs=true');
    } else if (context === "changes-apiurl") {
      return FauxtonAPI.urls('changes', 'apiurl', this.safeID(), '?descending=true&limit=100&include_docs=true');
    } else if (context === "app") {
      return "/database/" + this.safeID();
    }
    if (this.partitioned) {
      return Helpers.getServerUrl("/" + this.safeID()) + '?partitioned=true';
    }
    return Helpers.getServerUrl("/" + this.safeID());

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
      query = "?" + app.utils.queryParams(this.params);
    }

    if (!context) { context = 'server';}

    return FauxtonAPI.urls('changes', context, this.database.safeID(), query);
  },

  parse: function (resp) {
    this.last_seq = resp.last_seq;
    return resp.results;
  }
});

export default Databases;
