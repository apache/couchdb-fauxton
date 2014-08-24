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
  "cloudant.pagingcollection"
],

function(app, FauxtonAPI, PagingCollection) {
 var Resources = {};


   Resources.QueryParams = (function () {
    var _eachParams = function (params, action) {
      // clone to avoid in-place modification
      var result = _.clone(params);

      _.each(['startkey', 'endkey', 'key'], function (key) {
        if (_.has(result, key)) {
          result[key] = action(result[key]);
        }
      });

      return result;
    };

    return {
      parse: function (params) {
        return _eachParams(params, JSON.parse);
      },

      stringify: function (params) {
        return _eachParams(params, JSON.stringify);
      }
    };
  })();

  Resources.ViewRow = FauxtonAPI.Model.extend({
    // this is a hack so that backbone.collections doesn't group
    // these by id and reduce the number of items returned.
    idAttribute: "_id",

    docType: function() {
      if (!this.id) return "reduction";

      return this.id.match(/^_design/) ? "design doc" : "doc";
    },
    documentation: function(){
      return "docs";
    },
    url: function(context) {
      return this.collection.database.url(context) + "/" + this.safeID();
    },

    isEditable: function() {
      return this.docType() != "reduction";
    },
    safeID: function() {
      var id = this.id || this.get("id");

      return app.utils.safeURLName(id);
    },

    prettyJSON: function() {
      //var data = this.get("doc") ? this.get("doc") : this;
      return JSON.stringify(this, null, "  ");
    }
  });


  Resources.PouchIndexCollection = PagingCollection.extend({
    model: Resources.ViewRow,
    documentation: function(){
      return "docs";
    },
    initialize: function(_models, options) {
      this.database = options.database;
      this.rows = options.rows;
      this.view = options.view;
      this.design = options.design.replace('_design/','');
      this.params = _.extend({limit: 20, reduce: false}, options.params);

      this.idxType = "_view";
    },

    url: function () {
      return '';
    },

    simple: function () {
      var docs = this.map(function (item) {
        return {
          _id: item.id,
          key: item.get('key'),
          value: item.get('value')
        };
      });

      return new Resources.PouchIndexCollection(docs, {
        database: this.database,
        params: this.params,
        view: this.view,
        design: this.design,
        rows: this.rows
      });

    },

    fetch: function() {
      var deferred = FauxtonAPI.Deferred();
      this.reset(this.rows, {silent: true});

      this.viewMeta = {
        total_rows: this.rows.length,
        offset: 0,
        update_seq: false
      };

      deferred.resolve();
      return deferred;
    },

    totalRows: function() {
      return this.viewMeta.total_rows || "unknown";
    },

    updateSeq: function() {
      return this.viewMeta.update_seq || false;
    },

    buildAllDocs: function(){
      this.fetch();
    },

    allDocs: function(){
      return this.models;
    }
  });


  Resources.IndexCollection = PagingCollection.extend({
    model: Resources.ViewRow,
    documentation: function(){
      return "docs";
    },
    initialize: function(_models, options) {
      this.database = options.database;
      this.params = _.extend({limit: 20, reduce: false}, options.params);

      this.idxType = "_view";
      this.view = options.view;
      this.design = options.design.replace('_design/','');
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
        var parsedParam = Resources.QueryParams.stringify(this.params);
        query = "?" + $.param(parsedParam);
      }

      var startOfUrl = app.host;
      if (context === 'app') {
        startOfUrl = 'database';
      } else if (context === "apiurl"){
        startOfUrl = window.location.origin;
      }
      var design = app.utils.safeURLName(this.design),
          view = app.utils.safeURLName(this.view);

      var url = [startOfUrl, this.database.safeID(), "_design", design, this.idxType, view];
      return url.join("/") + query;
    },

    url: function () {
      return this.urlRef.apply(this, arguments);
    },

    totalRows: function() {
      if (this.params.reduce) { return "unknown_reduce";}

      return this.viewMeta.total_rows || "unknown";
    },

    updateSeq: function() {
      return this.viewMeta.update_seq || false;
    },

    simple: function () {
      var docs = this.map(function (item) {
        return {
          _id: item.id,
          key: item.get('key'),
          value: item.get('value')
        };
      });

      return new Resources.IndexCollection(docs, {
        database: this.database,
        params: this.params,
        view: this.view,
        design: this.design
      });
    },

    parse: function(resp) {
      var rows = resp.rows;
      this.endTime = new Date().getTime();
      this.requestDuration = (this.endTime - this.startTime);

      return PagingCollection.prototype.parse.apply(this, arguments);
    },

    buildAllDocs: function(){
      this.fetch();
    },

    // We implement our own fetch to store the starttime so we that
    // we can get the request duration
    fetch: function () {
      this.startTime = new Date().getTime();
      return PagingCollection.prototype.fetch.call(this);
    },

    allDocs: function(){
      return this.models;
    },

    // This is taken from futon.browse.js $.timeString
    requestDurationInString: function () {
      var ms, sec, min, h, timeString, milliseconds = this.requestDuration;

      sec = Math.floor(milliseconds / 1000.0);
      min = Math.floor(sec / 60.0);
      sec = (sec % 60.0).toString();
      if (sec.length < 2) {
         sec = "0" + sec;
      }

      h = (Math.floor(min / 60.0)).toString();
      if (h.length < 2) {
        h = "0" + h;
      }

      min = (min % 60.0).toString();
      if (min.length < 2) {
        min = "0" + min;
      }

      timeString = h + ":" + min + ":" + sec;

      ms = (milliseconds % 1000.0).toString();
      while (ms.length < 3) {
        ms = "0" + ms;
      }
      timeString += "." + ms;

      return timeString;
    }

  });

  return Resources;
});
