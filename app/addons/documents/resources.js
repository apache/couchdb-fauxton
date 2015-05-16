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
  'addons/documents/shared-resources',
  'cloudant.pagingcollection'
],

function (app, FauxtonAPI, Documents, PagingCollection) {

  Documents.QueryParams = (function () {
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


  Documents.DdocInfo = FauxtonAPI.Model.extend({
    idAttribute: "_id",
    documentation: function () {
      return FauxtonAPI.constants.DOC_URLS.GENERAL;
    },
    initialize: function (_attrs, options) {
      this.database = options.database;
    },

    url: function (context) {
      if (!context) {
        context = 'server';
      }

      return FauxtonAPI.urls('designDocs', context, this.database.safeID(), this.safeID());
    },

    // Need this to work around backbone router thinking _design/foo
    // is a separate route. Alternatively, maybe these should be
    // treated separately. For instance, we could default into the
    // json editor for docs, or into a ddoc specific page.
    safeID: function () {
      var ddoc = this.id.replace(/^_design\//, "");
      return "_design/" + app.utils.safeURLName(ddoc);
    }
  });

  Documents.MangoIndex = Documents.Doc.extend({
    idAttribute: 'name',

    isNew: function () {
      // never use put
      return true;
    },

    isDeletable: function () {
      return this.get('type') !== 'special';
    },

    isFromView: function () {
      return false;
    },

    url: function () {
      var database = this.database.safeID();

      return FauxtonAPI.urls('mango', 'index-server', database);
    }
  });

  Documents.MangoIndexCollection = PagingCollection.extend({
    model: Documents.MangoIndex,
    initialize: function (_attr, options) {
      var defaultLimit = FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;

      this.database = options.database;
      this.params = _.extend({limit: defaultLimit}, options.params);
    },

    url: function () {
      return this.urlRef.apply(this, arguments);
    },

    updateSeq: function () {
      return false;
    },

    isEditable: function () {
      return false;
    },

    parse: function (res) {
      return res.indexes;
    },

    urlRef: function (params) {
      var database = this.database.safeID(),
          query = '';

      if (params) {
        if (!_.isEmpty(params)) {
          query = '?' + $.param(params);
        } else {
          query = '';
        }
      } else if (this.params) {
        var parsedParam = Documents.QueryParams.stringify(this.params);
        query = '?' + $.param(parsedParam);
      }

      return FauxtonAPI.urls('mango', 'index-apiurl', database, query);
    }
  });

  Documents.NewDoc = Documents.Doc.extend({
    fetch: function () {
      var uuid = new FauxtonAPI.UUID();
      var deferred = this.deferred = $.Deferred();
      var that = this;

      uuid.fetch().done(function () {
        that.set("_id", uuid.next());
        deferred.resolve();
      });

      return deferred.promise();
    }

  });

  Documents.BulkDeleteDoc = FauxtonAPI.Model.extend({
    idAttribute: "_id"
  });

  Documents.BulkDeleteDocCollection = FauxtonAPI.Collection.extend({

    model: Documents.BulkDeleteDoc,

    sync: function () {

    },

    initialize: function (models, options) {
      this.databaseId = options.databaseId;
    },

    bulkDelete: function () {
      var payload = this.createPayload(this.toJSON()),
          promise = FauxtonAPI.Deferred(),
          that = this;

      $.ajax({
        type: 'POST',
        url: app.host + '/' + this.databaseId + '/_bulk_docs',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(payload),
      })
      .then(function (res) {
        that.handleResponse(res, promise);
      })
      .fail(function () {
        var ids = _.reduce(that.toArray(), function (acc, doc) {
          acc.push(doc.id);
          return acc;
        }, []);
        that.trigger('error', ids);
        promise.reject(ids);
      });

      return promise;
    },

    handleResponse: function (res, promise) {
      var ids = _.reduce(res, function (ids, doc) {
        if (doc.error) {
          ids.errorIds.push(doc.id);
        }

        if (!doc.error) {
          ids.successIds.push(doc.id);
        }

        return ids;
      }, {errorIds: [], successIds: []});

      this.removeDocuments(ids.successIds);

      if (ids.errorIds.length) {
        this.trigger('error', ids.errorIds);
      }

      // This is kind of tricky. If there are no documents deleted then rejects
      // otherwise resolve with list of successful and failed documents
      if (!_.isEmpty(ids.successIds)) {
        promise.resolve(ids);
      } else {
        promise.reject(ids.errorIds);
      }

      this.trigger('updated');
    },

    removeDocuments: function (ids) {
      var reloadDesignDocs = false;
      _.each(ids, function (id) {
        if (/_design/.test(id)) {
          reloadDesignDocs = true;
        }

        this.remove(this.get(id));
      }, this);

      if (reloadDesignDocs) {
        FauxtonAPI.triggerRouteEvent('reloadDesignDocs');
      }

      this.trigger('removed', ids);
    },

    createPayload: function (documents) {
      var documentList = documents;

      return {
        docs: documentList
      };
    }
  });

  Documents.IndexCollection = PagingCollection.extend({
    model: Documents.Doc,
    documentation: function () {
      return FauxtonAPI.constants.DOC_URLS.GENERAL;
    },
    initialize: function (_models, options) {
      this.database = options.database;
      this.params = _.extend({limit: 20, reduce: false}, options.params);

      this.idxType = "_view";
      this.view = options.view;
      this.design = options.design.replace('_design/', '');
      this.perPageLimit = options.perPageLimit || 20;

      if (!this.params.limit) {
        this.params.limit = this.perPageLimit;
      }
    },

    isEditable: function () {
      return !this.params.reduce;
    },

    urlRef: function (params) {
      var query = "";

      if (params) {
        if (!_.isEmpty(params)) {
          query = "?" + $.param(params);
        } else {
          query = '';
        }
      } else if (this.params) {
        var parsedParam = Documents.QueryParams.stringify(this.params);
        query = "?" + $.param(parsedParam);
      }

      var database = this.database.safeID(),
          design = app.utils.safeURLName(this.design),
          view = app.utils.safeURLName(this.view),
          url = FauxtonAPI.urls('view', 'apiurl', database, design, view);

      return url + query;
    },

    url: function () {
      return this.urlRef.apply(this, arguments);
    },

    totalRows: function () {
      if (this.params.reduce) { return "unknown_reduce";}

      return this.viewMeta.total_rows || "unknown";
    },

    updateSeq: function () {
      if (!this.viewMeta) {
        return false;
      }

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

      return new Documents.IndexCollection(docs, {
        database: this.database,
        params: this.params,
        view: this.view,
        design: this.design
      });
    },

    parse: function (resp) {
      var rows = resp.rows;
      this.endTime = new Date().getTime();
      this.requestDuration = (this.endTime - this.startTime);

      return PagingCollection.prototype.parse.apply(this, arguments);
    },

    buildAllDocs: function () {
      this.fetch();
    },

    // We implement our own fetch to store the starttime so we that
    // we can get the request duration
    fetch: function () {
      this.startTime = new Date().getTime();
      return PagingCollection.prototype.fetch.call(this);
    },

    allDocs: function () {
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


  Documents.PouchIndexCollection = PagingCollection.extend({
    model: Documents.ViewRow,
    documentation: function () {
      return FauxtonAPI.constants.DOC_URLS.GENERAL;
    },
    initialize: function (_models, options) {
      this.database = options.database;
      this.rows = options.rows;
      this.view = options.view;
      this.design = options.design.replace('_design/', '');
      this.params = _.extend({limit: 20, reduce: false}, options.params);
      this.idxType = "_view";

      this.viewMeta = {
        total_rows: this.rows.length,
        offset: 0,
        update_seq: false
      };
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

      return new Documents.PouchIndexCollection(docs, {
        database: this.database,
        params: this.params,
        view: this.view,
        design: this.design,
        rows: this.rows
      });

    },

    fetch: function () {
      var deferred = FauxtonAPI.Deferred();
      this.reset(this.rows, {silent: true});

      deferred.resolve();
      return deferred;
    },

    totalRows: function () {
      return this.viewMeta.total_rows || "unknown";
    },

    updateSeq: function () {
      return this.viewMeta.update_seq || false;
    },

    buildAllDocs: function () {
      this.fetch();
    },

    allDocs: function () {
      return this.models;
    }
  });

  Documents.setUpDropdown = function (database) {
    var defaultMenuLinks = [{
      links: [{
        title: 'Replicate Database',
        icon: 'fonticon-replicate',
        url: FauxtonAPI.urls('replication', 'app', database.get('id'))
      }, {
        title: 'Delete',
        icon: 'fonticon-trash',
        trigger: 'database:delete'
      }]
    }];

    defaultMenuLinks.push({
      title: 'Add new',
      links: Documents.getExtensionLinks(database)
    });

    return defaultMenuLinks;
  };

  Documents.getExtensionLinks = function (database) {
    var newUrlPrefix = '#' + FauxtonAPI.urls('databaseBaseURL', 'app', database.get('id'));
    var menuLinks = [{
      title: 'New Doc',
      url: newUrlPrefix + '/new',
      icon: 'fonticon-plus-circled'
    }, {
      title: 'New View',
      url: newUrlPrefix + '/new_view',
      icon: 'fonticon-plus-circled'
    }];

    return _.reduce(FauxtonAPI.getExtensions('sidebar:links'), function (menuLinks, link) {
      menuLinks.push({
        title: link.title,
        url: newUrlPrefix + "/" + link.url,
        icon: 'fonticon-plus-circled'
      });
      return menuLinks;
    }, menuLinks);
  };

  Documents.RevTreeDataModel = Backbone.Model.extend({
    initialize: function (url) {
      this.url = url;
      console.log("inside initialize");
    },
    url: function () {
      return this.url;
    },

    sync: function (method, model, options) {
      console.log("inside Sync-----" + this.url);
      var params = {
        error: options.error,
        success: options.success,
        url: this.url,
        type: 'GET',
        dataType: 'text',
        async: false
      };

      return $.ajax(params);
    },
    parse: function (response) {

      var parsedResult = [];
      var splitResponse = response.split(/(\n|\r\n|\r)/);

      for (var i = 0; i < splitResponse.length; i++) {
        if (String(splitResponse[i]).charAt(0) == "{") {
          parsedResult.push(JSON.parse(splitResponse[i]));
        }
      }
      console.log(parsedResult);

      return {content: parsedResult};
    }
  });

  return Documents;
});
