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
import { deleteRequest } from "../../core/ajax";
import PagingCollection from "../../core/data/pagingcollection";

// defined here because this is contains the base resources used throughout the addon and outside,
// so it's the first code that gets run
const Documents = FauxtonAPI.addon();

Documents.Doc = class extends FauxtonAPI.Model {

  constructor(attributes, options) {
    super(attributes, options);
    this.idAttribute = '_id';
  }

  documentation() {
    return FauxtonAPI.constants.DOC_URLS.GENERAL;
  }

  url(context) {
    if (context === undefined) {
      context = 'server';
    }

    // new without id make a POST to the DB and not a PUT on a DB
    let id = this.safeID();
    if (!id) {
      id = '';
    }

    const query = this.fetchConflicts ? '?conflicts=true' : '';
    return FauxtonAPI.urls('document', context, this.getDatabase().safeID(), id, query);
  }

  initialize(_attrs, options) {
    if (this.collection && this.collection.database) {
      this.database = this.collection.database;
    } else if (options.database) {
      this.database = options.database;
    }

    if (options.fetchConflicts) {
      this.fetchConflicts = true;
    }
    this.partitionKey = options.partitionKey;
  }

  // HACK: the doc needs to know about the database, but it may be
  // set directly or indirectly in all docs
  getDatabase() {
    return this.database ? this.database : this.collection.database;
  }

  validate(attrs) {
    if (this.id && this.id !== attrs._id && this.get('_rev')) {
      return "Cannot change a documents id.";
    }
  }

  docType() {
    return app.utils.getDocTypeFromId(this.id);
  }

  // @deprecated, see isJSONDocBulkDeletable
  isBulkDeletable() {
    return !!this.id && !!this.get('_rev');
  }

  isDeletable() {
    return !!this.id;
  }

  isFromView() {
    return !this.id;
  }

  isMangoDoc() {
    if (!this.isDdoc()) return false;
    if (this.get('language') === 'query') {
      return true;
    }

    if (this.get('doc') && this.get('doc').language === 'query') {
      return true;
    }

    return false;
  }

  isDdoc() {
    return this.docType() === "design doc";
  }

  setDDocPartitionedOption(isPartitioned) {
    if (!this.isDdoc()) {
      return false;
    }
    let options = this.get('options');
    if (!options) {
      options = {};
    }
    options.partitioned = isPartitioned;
    this.set({ options });

    return true;
  }

  setDdocView(view, map, reduce) {
    if (!this.isDdoc()) {
      return false;
    }

    let views = this.get('views');
    // handles instances where the ddoc is empty (created manually)
    if (!views) {
      views = {};
      this.set({language: "javascript"});
    }
    const tempView = views[view] || {};

    if (reduce) {
      tempView.reduce = reduce;
    } else {
      delete tempView.reduce;
    }
    tempView.map = map;

    views[view] = tempView;
    this.set({views: views});

    return true;
  }

  removeDdocView(viewName) {
    if (!this.isDdoc()) return false;
    var views = this.get('views');

    delete views[viewName];
    this.set({views: views});
  }

  dDocModel() {
    if (!this.isDdoc()) return false;
    var doc = this.get('doc');

    if (doc) {
      doc._rev = this.get('_rev');
      return new Documents.Doc(doc, {database: this.database});
    }

    return this;
  }

  safeID() {
    return app.utils.getSafeIdForDoc(this.id);
  }

  destroy() {
    let url = this.url();
    if (url.indexOf('?') === -1) {
      url = url + "?rev=" + this.get('_rev');
    } else {
      url = url + "&rev=" + this.get('_rev');
    }
    return deleteRequest(url).then(res => {
      if (res.error) {
        throw new Error(res.reason || res.error);
      }
      return res;
    });
  }

  parse(resp) {
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
  }

  prettyJSON() {
    var data = this.get("doc") ? this.get("doc") : this.attributes;

    return JSON.stringify(data, null, "  ");
  }

  copy(copyId) {
    const attrs = Object.assign({}, this.attributes, {_id: copyId});
    delete attrs._rev;
    const clonedDoc = new this.constructor(attrs, {
      database: this.database
    });
    return clonedDoc.save();
  }

  isNewDoc() {
    return this.get('_rev') ? false : true;
  }
};

Documents.AllDocs = class extends PagingCollection {

  constructor(models, options) {
    super(models, options);
    this.model = Documents.Doc;
  }

  documentation() {
    return FauxtonAPI.constants.DOC_URLS.GENERAL;
  }

  initialize(_models, options) {
    this.viewMeta = options.viewMeta;
    this.database = options.database;
    this.params = _.clone(options.params);

    this.perPageLimit = options.perPageLimit || 20;

    if (!this.params.limit) {
      this.params.limit = this.perPageLimit;
    }
  }

  onRemove() {
    this.decrementTotalRows();
  }

  isEditable () {
    return true;
  }

  urlRef(context, params) {
    var query = "";

    if (params) {
      if (!_.isEmpty(params)) {
        query = "?" + app.utils.queryParams(params);
      } else {
        query = '';
      }
    } else if (this.params) {
      query = "?" + app.utils.queryParams(this.params);
    }
    if (_.isUndefined(context)) {
      context = 'server';
    }
    return FauxtonAPI.urls('allDocs', context, this.database.safeID(), query);
  }

  url() {
    return this.urlRef.apply(this, arguments);
  }

  simple() {
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
  }

  totalRows() {
    return this.viewMeta.total_rows || "unknown";
  }

  decrementTotalRows() {
    if (this.viewMeta.total_rows) {
      this.viewMeta.total_rows = this.viewMeta.total_rows - 1;
      this.trigger('totalRows:decrement');
    }
  }

  updateSeq() {
    if (!this.viewMeta) {
      return false;
    }
    return this.viewMeta.update_seq || false;
  }

  parse(resp) {
    var rows = resp.rows;

    // remove any query errors that may return without doc info
    // important for when querying keys on all docs
    var cleanRows = _.filter(rows, function (row) {
      return row.value;
    });

    resp.rows = _.map(cleanRows, function (row) {
      var res = {
        _id: row.id,
        _rev: row.value.rev,
        value: row.value,
        key: row.key
      };

      if (row.doc) {
        res.doc = row.doc;
      }

      return res;
    });

    return super.parse(resp);
  }

  clone() {
    return new Documents.AllDocs(this.models, {
      database: this.database,
      params: this.params,
      paging: this.paging
    });
  }
};

export default Documents;
