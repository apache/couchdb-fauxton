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
import Helpers from '../../helpers';
import FauxtonAPI from "../../core/api";
import { post } from "../../core/ajax";
import Documents from "./shared-resources";

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
    return app.utils.getSafeIdForDoc(this.id);
  }
});

Documents.NewDoc = Documents.Doc.extend({
  fetch: function () {
    const prefix = this.partitionKey ? (this.partitionKey + ':') : '';
    return Helpers.getUUID().then((res) => {
      if (res.uuids) {
        this.set("_id", prefix + res.uuids[0]);
      } else {
        this.set("_id", prefix + 'enter_document_id');
      }
      return res;
    }).catch(() => {
      // Don't throw error so the user is still able
      // to edit the new doc
      this.set("_id", prefix + 'enter_document_id');
    });
  }
});

Documents.BulkDeleteDoc = FauxtonAPI.Model.extend({
  idAttribute: "_id"
});

Documents.BulkDeleteDocCollection = FauxtonAPI.Collection.extend({

  model: Documents.BulkDeleteDoc,

  sync: function () {

  },

  initialize: function (models, options) {
    this.databaseId = options.databaseId;
  },

  url: function () {
    return FauxtonAPI.urls('bulk_docs', 'server', this.databaseId, '');
  },

  bulkDelete: function () {
    const payload = this.createPayload(this.toJSON());
    return new FauxtonAPI.Promise((resolve, reject) => {
      post(this.url(), payload).then(res => {
        if (res.error) {
          throw new Error(res.reason || res.error);
        }
        this.handleResponse(res, resolve, reject);
      }).catch(() => {
        const ids = _.reduce(this.toArray(), (acc, doc) => {
          acc.push(doc.id);
          return acc;
        }, []);
        this.trigger('error', ids);
        reject(ids);
      });
    });
  },

  handleResponse: function (res, resolve, reject) {
    var ids = _.reduce(res, function (ids, doc) {
      if (doc.error) {
        ids.errorIds.push(doc.id);
      }

      if (!doc.error) {
        ids.successIds.push(doc.id);
      }

      return ids;
    }, { errorIds: [], successIds: [] });

    this.removeDocuments(ids.successIds);

    if (ids.errorIds.length) {
      this.trigger('error', ids.errorIds);
    }

    // This is kind of tricky. If there are no documents deleted then rejects
    // otherwise resolve with list of successful and failed documents
    if (!_.isEmpty(ids.successIds)) {
      resolve(ids);
    } else {
      reject(ids.errorIds);
    }

    this.trigger('updated');
  },

  removeDocuments: function (ids) {
    _.each(ids, (id) => {
      this.remove(this.get(id));
    });

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
    return Helpers.getServerUrl(`/${this.databaseId}/_index/_bulk_delete`);
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

export default Documents;
