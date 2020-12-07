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
import Documents from "./routes";
import designDocInfoReducers from "./designdocinfo/reducers";
import reducers from "./index-results/reducers";
import mangoReducers from "./mango/mango.reducers";
import sidebarReducers from "./sidebar/reducers";
import partitionKeyReducers from "./partition-key/reducers";
import revisionBrowserReducers from './rev-browser/reducers';
import docEditorReducers from './doc-editor/reducers';
import changesReducers from './changes/reducers';
import indexEditorReducers from './index-editor/reducers';
import "./assets/less/documents.less";

FauxtonAPI.addReducers({
  indexResults: reducers,
  mangoQuery: mangoReducers,
  sidebar: sidebarReducers,
  revisionBrowser: revisionBrowserReducers,
  partitionKey: partitionKeyReducers,
  docEditor: docEditorReducers,
  changes: changesReducers,
  designDocInfo: designDocInfoReducers,
  indexEditor: indexEditorReducers
});

function getQueryParam (query) {
  if (!query) {
    query = '';
  }
  return query;
}

function partitionUrlComponent(partitionKey) {
  return partitionKey ? `/_partition/${partitionKey}` : '';
}

FauxtonAPI.registerUrls('allDocs', {
  server: function (id, query) {
    /** XXX DEPRECATED: use allDocsSanitized **/
    return Helpers.getServerUrl('/' + id + '/_all_docs' + getQueryParam(query));
  },
  app: function (id, partitionKey, query) {
    /** XXX DEPRECATED: use allDocsSanitized **/
    return 'database/' + id + partitionUrlComponent(partitionKey) + '/_all_docs' + getQueryParam(query);
  },
  apiurl: function (id, query) {
    /** XXX DEPRECATED: use allDocsSanitized **/
    return Helpers.getApiUrl('/' + id + '/_all_docs' + getQueryParam(query));
  }
});

FauxtonAPI.registerUrls('partitioned_allDocs', {
  app: function (databaseName, partitionKey, query) {
    return 'database/' + databaseName + '/_partition/' + partitionKey + '/_all_docs' + getQueryParam(query);
  },
  apiurl: function (databaseName, partitionKey, query) {
    return Helpers.getApiUrl('/' + databaseName + '/_partition/' + partitionKey + '/_all_docs' + getQueryParam(query));
  },
  server: function (databaseName, partitionKey, query) {
    return Helpers.getServerUrl('/' + databaseName + '/_partition/' + partitionKey + '/_all_docs' + getQueryParam(query));
  }
});

FauxtonAPI.registerUrls('allDocsSanitized', {
  server: function (id, query) {
    id = encodeURIComponent(id);
    return Helpers.getServerUrl('/' + id + '/_all_docs' + getQueryParam(query));
  },

  app: function (id, query) {
    id = encodeURIComponent(id);
    return 'database/' + id + '/_all_docs' + getQueryParam(query);
  },

  apiurl: function (id, query) {
    id = encodeURIComponent(id);
    return Helpers.getApiUrl('/' + id + '/_all_docs' + getQueryParam(query));
  }
});

FauxtonAPI.registerUrls('bulk_docs', {
  server: function (id, query) {
    return Helpers.getServerUrl('/' + encodeURIComponent(id) + '/_bulk_docs' + getQueryParam(query));
  },
  app: function (id, query) {
    return 'database/' + id + '/_bulk_docs' + getQueryParam(query);
  },
  apiurl: function (id, query) {
    return Helpers.getApiUrl('/' + id + '/_bulk_docs' + getQueryParam(query));
  }
});

FauxtonAPI.registerUrls('revision-browser', {
  app: function (id, doc) {
    return 'database/' + id + '/' + encodeURIComponent(doc) + '/conflicts';
  }
});

FauxtonAPI.registerUrls('designDocs', {
  server: function (id, designDoc) {
    return Helpers.getServerUrl('/' + id + '/' + designDoc + '/_info');
  },

  app: function (id, partitionKey, designDoc) {
    return 'database/' + id + partitionUrlComponent(partitionKey) + '/_design/' + app.utils.safeURLName(designDoc) + '/_info';
  },

  apiurl: function (id, designDoc) {
    return Helpers.getApiUrl('/' + id + '/' + designDoc + '/_info');
  }
});

FauxtonAPI.registerUrls('view', {
  server: function (database, partitionKey, designDoc, viewName) {
    return Helpers.getServerUrl('/' + database + partitionUrlComponent(partitionKey) + '/_design/' + designDoc + '/_view/' + viewName);
  },

  app: function (database, designDoc) {
    return 'database/' + database + '/_design/' + designDoc + '/_view/';
  },

  apiurl: function (id, partitionKey, designDoc, viewName) {
    return Helpers.getApiUrl('/' + id + partitionUrlComponent(partitionKey) + '/_design/' + designDoc + '/_view/' + viewName);
  },

  edit: function (database, partitionKey, designDoc, indexName) {
    return 'database/' + database + partitionUrlComponent(partitionKey) + '/_design/' + designDoc + '/_view/' + indexName + '/edit';
  },

  showView: function (database, partitionKey, designDoc, viewName) {
    return '/database/' + database + partitionUrlComponent(partitionKey) + '/' + designDoc + '/_view/' + viewName;
  },

  fragment: function (database, designDoc, viewName) {
    return 'database/' + database + designDoc + '/_view/' + viewName;
  }
});

FauxtonAPI.registerUrls('partitioned_view', {
  server: function (database, partitionKey, designDoc, viewName) {
    return Helpers.getServerUrl('/' + database + '/_partition/' + partitionKey + '/_design/' + designDoc + '/_view/' + viewName);
  },
  app: function (database, partitionKey, designDoc) {
    return 'database/' + database + '/_partition/' + partitionKey + '/_design/' + designDoc + '/_view/';
  },
  apiurl: function (database, partitionKey, designDoc, viewName) {
    return Helpers.getApiUrl('/' + database + '/_partition/' + partitionKey + '/_design/' + designDoc + '/_view/' + viewName);
  }
});

FauxtonAPI.registerUrls('document', {
  server: function (database, doc, query) {
    if (_.isUndefined(query)) {
      query = '';
    }
    return Helpers.getServerUrl('/' + database + '/' + doc + query);
  },

  attachment: function (database, doc, filename, query) {
    if (_.isUndefined(query)) {
      query = '';
    }
    return Helpers.getServerUrl('/' + database + '/' + doc + '/' + filename + query);
  },

  app: function (database, doc) {
    return '/database/' + database + '/' + doc;
  },

  apiurl: function (database, doc) {
    if (!doc) {
      // api url for creating a doc with POST
      return Helpers.getApiUrl('/' + database);
    }
    return Helpers.getApiUrl('/' + database + '/' + doc);
  },

  'web-index': function (database, doc) {
    return '/database/' + database + '/' + doc;
  }
});

FauxtonAPI.registerUrls('new', {
  newDocument: function (database) {
    return '/database/' + database + '/_new';
  },

  newView: function (database, partitionKey) {
    return '/database/' + database + partitionUrlComponent(partitionKey) + '/new_view';
  },

  addView: function (database, partitionKey, ddoc) {
    return '/database/' + database + partitionUrlComponent(partitionKey) + '/new_view/' + ddoc;
  }
});

FauxtonAPI.registerUrls('base', {
  server: function (database) {
    return Helpers.getServerUrl('/' + database + '/');
  },

  app: function (database) {
    return '/database/' + database + '/';
  },
});

FauxtonAPI.registerUrls('mango', {

  'index-server': function (db, query) {
    if (!query) {
      query = '';
    }

    return Helpers.getServerUrl('/' + db + '/_index' + query);
  },

  'index-apiurl': function (db, partitionKey, query) {
    if (!query) {
      query = '';
    }

    return Helpers.getApiUrl('/' + db + partitionUrlComponent(partitionKey) + '/_index' + query);
  },

  'index-app': function (db, partitionKey, query) {
    if (!query) {
      query = '';
    }

    return 'database/' + db + partitionUrlComponent(partitionKey) + '/_index' + query;
  },

  'index-server-bulk-delete': function (db) {
    return Helpers.getServerUrl('/' + db + '/_index/_bulk_delete');
  },

  'query-server': function (db, partitionKey, query) {
    if (!query) {
      query = '';
    }

    return Helpers.getServerUrl('/' + db + partitionUrlComponent(partitionKey) + '/_find' + query);
  },

  'query-apiurl': function (db, partitionKey, query) {
    if (!query) {
      query = '';
    }

    return Helpers.getApiUrl('/' + db + partitionUrlComponent(partitionKey) + '/_find' + query);
  },

  'query-app': function (db, partitionKey, query) {
    if (!query) {
      query = '';
    }

    return 'database/' + db + partitionUrlComponent(partitionKey) + '/_find' + query;
  },

  'explain-server': function (db, partitionKey) {
    return Helpers.getServerUrl('/' + db + partitionUrlComponent(partitionKey) + '/_explain');
  },

  'explain-apiurl': function (db, partitionKey) {
    return Helpers.getApiUrl('/' + db + partitionUrlComponent(partitionKey) + '/_explain');
  }
});

export default Documents;
