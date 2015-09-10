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

  // Modules
  "addons/documents/routes"
],

function (app, FauxtonAPI, Documents) {

  FauxtonAPI.registerUrls( 'allDocs', {
    server: function (id, query) {
      return app.host + '/' + id + '/_all_docs' + query;
    },
    app: function (id, query) {
      return 'database/' + id + '/_all_docs' + query;
    },
    apiurl: function (id, query) {
      return window.location.origin + '/' + id + '/_all_docs' + query;
    }
  });

  FauxtonAPI.registerUrls( 'designDocs', {
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

  FauxtonAPI.registerUrls( 'view', {
    server: function (id, designDoc, viewName) {
      return app.host + '/' + id + '/_design/' + designDoc + '/_view/' + viewName;
    },

    app: function (id, designDoc) {
      return 'database/' + id + '/_design/' + designDoc + '/_view/';
    },

    apiurl: function (id, designDoc, viewName) {
      return window.location.origin + '/' + id + '/_design/' + designDoc + '/_view/' + viewName;
    },

    showNewlySavedView: function (database, designDocs, viewName) {
      return '/database/' + database + '/' + designDocs + '/_view/' + viewName;
    },

    fragment: function (database, designDocs, viewName) {
      return 'database/' + database + designDocs + '/_view/' + viewName;
    }
  });

  FauxtonAPI.registerUrls('document', {
    server: function (database, doc) {
      return app.host + '/' + database + '/' + doc;
    },

    attachment: function (database, doc, filename, query) {
      return app.host + '/' + database + '/' + doc + '/' + filename + query;
    },

    app: function (database, doc) {
      return '/database/' + database + '/' + doc;
    },

    apiurl: function (database, doc) {
      return window.location.origin + '/' + database + '/' + doc;
    },

    'web-index': function (database, doc) {
      return '/database/' + database + '/' + doc;
    }
  });

  FauxtonAPI.registerUrls( 'new', {
    newDocument: function (database) {
      return '/database/' + database + '/new' ;
    },

    newView: function (database) {
      return '/database/' + database + '/new_view' ;
    },

    addView: function (database, ddoc) {
      return '/database/' + database + '/new_view/' + ddoc;
    }
  });

  FauxtonAPI.registerUrls( 'base', {
    server: function (database) {
      return app.host + '/' + database + '/' ;
    },

    app: function (database) {
      return '/database/' + database + '/' ;
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

  return Documents;
});
