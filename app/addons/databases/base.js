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
  "../../app",
  "../../core/api",
  "./routes"
],

function (app, FauxtonAPI, Databases) {

  Databases.initialize = function () {
    FauxtonAPI.addHeaderLink({
      href:"#/_all_dbs",
      title:"Databases",
      icon: "fonticon-database",
      className: 'databases'
    });
  };

  // Utility functions
  Databases.databaseUrl = function (database) {
    var name = _.isObject(database) ? database.id : database,
        dbname = app.utils.safeURLName(name);

    return ['/database/', dbname, '/_all_docs?limit=' + Databases.DocLimit].join('');
  };

  FauxtonAPI.registerUrls('changes', {
    server: function (id, query) {
      return app.host + '/' + id + '/_changes' + query;

    },
    app: function (id, query) {
      return '/database/' + id + '/_changes' + query;
    },

    apiurl: function (id, query) {
      return window.location.origin + '/' + id + '/_changes' + query;
    }
  });

  FauxtonAPI.registerUrls('allDBs', {
    app: function () {
      return '_all_dbs';
    }
  });

  FauxtonAPI.registerUrls('databaseBaseURL', {
    server: function (database) {
      return window.location.origin + '/' + database;
    },
    app: function (database) {
      return '/database/' + database;
    }
  });

  FauxtonAPI.registerUrls('permissions', {
    server: function (db) {
      return app.host + '/' + db + '/_security';
    },

    app: function (db) {
      return '/database/' + db + '/permissions';
    },

    apiurl: function (db) {
      return window.location.origin + '/' + db + '/_security';
    }
  });

  return Databases;
});
