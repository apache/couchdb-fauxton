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
import Documents from "./routes";
import "./assets/less/documents.less";

function getQueryParam (query) {
  if (!query) {
    query = '';
  }
  return query;
}

FauxtonAPI.registerUrls('allDocs', {
  server: function (id, query) {
    return app.host + '/' + id + '/_all_docs' + getQueryParam(query);
  },
  app: function (id, query) {
    return 'database/' + id + '/_all_docs' + getQueryParam(query);
  },
  apiurl: function (id, query) {
    return window.location.origin + '/' + id + '/_all_docs' + getQueryParam(query);
  }
});

FauxtonAPI.registerUrls('bulk_docs', {
  server: function (id, query) {
    return app.host + '/' + id + '/_bulk_docs' + getQueryParam(query);
  },
  app: function (id, query) {
    return 'database/' + id + '/_bulk_docs' + getQueryParam(query);
  },
  apiurl: function (id, query) {
    return window.location.origin + '/' + id + '/_bulk_docs' + getQueryParam(query);
  }
});

FauxtonAPI.registerUrls('revision-browser', {
  app: function (id, doc) {
    return 'database/' + id + '/' + doc + '/conflicts';
  }
});

FauxtonAPI.registerUrls('designDocs', {
  server: function (id, designDoc) {
    return app.host + '/' + id + '/' + designDoc + '/_info';
  },

  app: function (id, designDoc) {
    return 'database/' + id + '/_design/' + app.utils.safeURLName(designDoc) + '/_info';
  },

  apiurl: function (id, designDoc) {
    return window.location.origin + '/' + id + '/' + designDoc + '/_info';
  }
});

FauxtonAPI.registerUrls('view', {
  server: function (database, designDoc, viewName) {
    return app.host + '/' + database + '/_design/' + designDoc + '/_view/' + viewName;
  },

  app: function (database, designDoc) {
    return 'database/' + database + '/_design/' + designDoc + '/_view/';
  },

  apiurl: function (id, designDoc, viewName) {
    return window.location.origin + '/' + id + '/_design/' + designDoc + '/_view/' + viewName;
  },

  edit: function (database, designDoc, indexName) {
    return 'database/' + database + '/_design/' + designDoc + '/_view/' + indexName + '/edit';
  },

  showView: function (database, designDoc, viewName) {
    return '/database/' + database + '/' + designDoc + '/_view/' + viewName;
  },

  fragment: function (database, designDoc, viewName) {
    return 'database/' + database + designDoc + '/_view/' + viewName;
  }
});

FauxtonAPI.registerUrls('document', {
  server: function (database, doc, query) {
    if (_.isUndefined(query)) {
      query = '';
    }
    return app.host + '/' + database + '/' + doc + query;
  },

  attachment: function (database, doc, filename, query) {
    if (_.isUndefined(query)) {
      query = '';
    }
    return app.host + '/' + database + '/' + doc + '/' + filename + query;
  },

  app: function (database, doc) {
    return '/database/' + database + '/' + doc;
  },

  apiurl: function (database, doc) {
    if (!doc) {
      // api url for creating a doc with POST
      return window.location.origin + '/' + database;
    }

    return window.location.origin + '/' + database + '/' + doc;
  },

  'web-index': function (database, doc) {
    return '/database/' + database + '/' + doc;
  }
});

FauxtonAPI.registerUrls('new', {
  newDocument: function (database) {
    return '/database/' + database + '/new';
  },

  newView: function (database) {
    return '/database/' + database + '/new_view';
  },

  addView: function (database, ddoc) {
    return '/database/' + database + '/new_view/' + ddoc;
  }
});

FauxtonAPI.registerUrls('base', {
  server: function (database) {
    return app.host + '/' + database + '/';
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

    return app.host + '/' + db + '/_index' + query;
  },

  'index-apiurl': function (db, query) {
    if (!query) {
      query = '';
    }

    return window.location.origin + '/' + db + '/_index' + query;
  },

  'index-app': function (db, query) {
    if (!query) {
      query = '';
    }

    return 'database/' + db + '/_index' + query;
  },

  'query-server': function (db, query) {
    if (!query) {
      query = '';
    }

    return app.host + '/' + db + '/_find' + query;
  },

  'query-apiurl': function (db, query) {
    if (!query) {
      query = '';
    }

    return window.location.origin + '/' + db + '/_find' + query;
  },

  'query-app': function (db, query) {
    if (!query) {
      query = '';
    }

    return 'database/' + db + '/_find' + query;
  }
});

export default Documents;
