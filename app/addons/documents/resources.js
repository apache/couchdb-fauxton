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
import Documents from "./shared-resources";
import PagingCollection from "../../../assets/js/plugins/cloudant.pagingcollection";


Documents.UUID = FauxtonAPI.Model.extend({
  initialize: function (options) {
    options = _.extend({count: 1}, options);
    this.count = options.count;
  },

  url: function () {
    return app.host + "/_uuids?count=" + this.count;
  },

  next: function () {
    return this.get("uuids").pop();
  }
});


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
  idAttribute: 'ddoc',

  getId: function () {

    if (this.id) {
      return this.id;
    }


    return '_all_docs';
  },

  isNew: function () {
    // never use put
    return true;
  },

  // @deprecated, see isJSONDocBulkDeletable
  isDeletable: function () {
    return this.get('type') !== 'special';
  },

  // @deprecated, see isJSONDocBulkDeletable
  isBulkDeletable: function () {
    return this.isDeletable();
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

  collectionType: 'MangoIndex',

  url: function () {
    return this.urlRef.apply(this, arguments);
  },

  updateSeq: function () {
    return false;
  },

  //@deprecated, see isJSONDocEditable
  isEditable: function () {
    return false;
  },

  parse: function (res) {
    return res.indexes;
  },

  urlRef: function (context, params) {
    var database = this.database.safeID(),
        query = '';

    if (!context) {
      context = 'index-server';
    }

    return FauxtonAPI.urls('mango', context, database, query);
  }
});

// MANGO INDEX EDITOR
Documents.MangoDoc = Documents.Doc.extend({
  isMangoDoc: function () {
    return true;
  }
});

Documents.MangoDocumentCollection = PagingCollection.extend({
  model: Documents.MangoDoc,

  collectionType: 'MangoDocumentCollection',

  initialize: function (_attr, options) {
    var defaultLimit = FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;

    this.database = options.database;
    this.params = _.extend({limit: defaultLimit}, options.params);

    this.paging = _.defaults((options.paging || {}), {
      defaultParams: _.defaults({}, options.params),
      hasNext: false,
      hasPrevious: false,
      params: {},
      pageSize: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE,
      direction: undefined
    });

    this.paging.params = _.clone(this.paging.defaultParams);
  },

  url: function () {
    return this.urlRef.apply(this, arguments);
  },

  updateSeq: function () {
    return false;
  },

  isEditable: function () {
    return true;
  },

  setQuery: function (query) {
    this.query = query;
    return this;
  },

  pageSizeReset: function (pageSize, opts) {
    var options = _.defaults((opts || {}), {fetch: true});
    this.paging.direction = undefined;
    this.paging.pageSize = pageSize;
    this.paging.params = this.paging.defaultParams;
    this.paging.params.limit = pageSize;

    if (options.fetch) {
      return this.fetch();
    }
  },

  _iterate: function (offset, opts) {
    var options = _.defaults((opts || {}), {fetch: true});

    this.paging.params = this.calculateParams(this.paging.params, offset, this.paging.pageSize);

    return this.fetch();
  },

  getPaginatedQuery: function () {
    var paginatedQuery = JSON.parse(JSON.stringify(this.query));

    if (!this.paging.direction && this.paging.params.limit > 0) {
      this.paging.direction = 'fetch';
      this.paging.params.limit = this.paging.params.limit + 1;
    }

    // just update if NOT provided by editor
    if (!paginatedQuery.limit) {
      paginatedQuery.limit = this.paging.params.limit;
    }

    if (!paginatedQuery.skip) {
      paginatedQuery.skip = this.paging.params.skip;
    }

    return paginatedQuery;
  },

  fetch: function () {
    var url = this.urlRef(),
              promise = FauxtonAPI.Deferred(),
              query = this.getPaginatedQuery();

    $.ajax({
      type: 'POST',
      url: url,
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(query),
    })
    .then(function (res) {
      this.handleResponse(res, promise);
    }.bind(this))
    .fail(function (res) {
      promise.reject(res.responseJSON);
    }.bind(this));

    return promise;
  },

  parse: function (resp) {
    var rows = resp.docs;

    this.paging.hasNext = this.paging.hasPrevious = false;

    this.viewMeta = {
      total_rows: resp.total_rows,
      offset: resp.offset,
      update_seq: resp.update_seq
    };

    var skipLimit = this.paging.defaultParams.skip || 0;
    if (this.paging.params.skip > skipLimit) {
      this.paging.hasPrevious = true;
    }

    if (rows.length === this.paging.pageSize + 1) {
      this.paging.hasNext = true;

      // remove the next page marker result
      rows.pop();
      this.viewMeta.total_rows = this.viewMeta.total_rows - 1;
    }

    return rows;
  },

  handleResponse: function (res, promise) {
    var models = this.parse(res);

    this.reset(models);

    promise.resolve();
  },

  urlRef: function (context) {
    var database = this.database.safeID(),
        query = '';

    if (!context) {
      context = 'query-server';
    }

    return FauxtonAPI.urls('mango', context, database, query);
  }
});

Documents.NewDoc = Documents.Doc.extend({
  fetch: function () {
    var uuid = new Documents.UUID();
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

  url: function () {
    return app.host + '/' + this.databaseId + '/_bulk_docs';
  },

  bulkDelete: function () {
    var payload = this.createPayload(this.toJSON()),
        promise = FauxtonAPI.Deferred(),
        that = this;

    $.ajax({
      type: 'POST',
      url: this.url(),
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

Documents.MangoBulkDeleteDocCollection = Documents.BulkDeleteDocCollection.extend({
  url: function () {
    return app.host + '/' + this.databaseId + '/_index/_bulk_delete';
  },

  createPayload: function (documents) {
    var documentList = documents
      .filter(function (doc) {
        return doc._id !== '_all_docs';
      })
      .map(function (doc) {
        return doc._id;
      });

    return {
      docids: documentList
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

  urlRef: function (context, params) {
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

    if (!context) {
      context = 'server';
    }

    var database = this.database.safeID(),
        design = app.utils.safeURLName(this.design),
        view = app.utils.safeURLName(this.view),
        url = FauxtonAPI.urls('view', context, database, design, view);

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

export default Documents;
