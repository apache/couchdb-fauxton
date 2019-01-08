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


class DdocInfoModel extends FauxtonAPI.Model {

  constructor(attributes, options) {
    super(attributes, options);
    this.idAttribute = '_id';
    if (options) {
      this.database = options.database;
    }
  }

  documentation() {
    return FauxtonAPI.constants.DOC_URLS.GENERAL;
  }

  url(context) {
    if (!context) {
      context = 'server';
    }

    return FauxtonAPI.urls('designDocs', context, this.database.safeID(), this.safeID());
  }

  // Need this to work around backbone router thinking _design/foo
  // is a separate route. Alternatively, maybe these should be
  // treated separately. For instance, we could default into the
  // json editor for docs, or into a ddoc specific page.
  safeID() {
    var ddoc = this.id.replace(/^_design\//, "");
    return "_design/" + app.utils.safeURLName(ddoc);
  }

  parse(data) {
    if (!data._id) {
      data._id = '_design/' + data.name;
    }
    return data;
  }
}
Documents.DdocInfo = DdocInfoModel;

class NewDocModel extends Documents.Doc {
  fetch() {
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
}
Documents.NewDoc = NewDocModel;

export default Documents;
