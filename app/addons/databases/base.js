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
import { get } from "../../core/ajax";
import FauxtonAPI from "../../core/api";
import Databases from "./routes";
import Actions from "./actions";
import reducers from './reducers';
import "./assets/less/databases.less";

Databases.initialize = function () {
  FauxtonAPI.addHeaderLink({
    href:"#/_all_dbs",
    title:"Databases",
    icon: "fonticon-database",
    className: 'databases'
  });
  Actions.checkPartitionedQueriesIsAvailable();
};

function partitionUrlComponent(partitionKey) {
  return partitionKey ? `/_partition/${partitionKey}` : '';
}

function checkPartitionedDatabaseFeature () {
  // Checks if the CouchDB server supports Partitioned Databases
  return get(Helpers.getServerUrl("/")).then((couchdb) => {
    if (couchdb.features && couchdb.features.includes('partitioned')) {
      return true;
    }
    // Check if it's enabled as an experimental feature
    if (couchdb.features_flags && couchdb.features_flags.includes('partitioned')) {
      return true;
    }
    return false;
  }).catch(() => {
    return false;
  });
}

// This extension can be used by addons to add extra checks when
// deciding if the partitioned database feature should be enabled.
// The registered element should be a function that returns a
// Promise resolving to either true or false.
Databases.PARTITONED_DB_CHECK_EXTENSION = 'Databases:PartitionedDbCheck';
FauxtonAPI.registerExtension(Databases.PARTITONED_DB_CHECK_EXTENSION, checkPartitionedDatabaseFeature);

FauxtonAPI.addReducers({
  databases: reducers
});

// Utility functions
Databases.databaseUrl = function (database) {
  var name = _.isObject(database) ? database.id : database,
      dbname = app.utils.safeURLName(name);

  return ['/database/', dbname, '/_all_docs?limit=' + Databases.DocLimit].join('');
};

FauxtonAPI.registerUrls('changes', {
  server: function (id, query) {
    return Helpers.getServerUrl('/' + id + '/_changes' + query);
  },

  app: function (id, partitionKey, query) {
    return '/database/' + id + partitionUrlComponent(partitionKey) + '/_changes' + query;
  },

  apiurl: function (id, query) {
    return Helpers.getApiUrl('/' + id + '/_changes' + query);
  }
});

FauxtonAPI.registerUrls('allDBs', {
  server: function (query = '') {
    return Helpers.getServerUrl(`/_all_dbs${query}`);
  },

  app: function () {
    return '_all_dbs';
  },

  apiurl: function () {
    return Helpers.getApiUrl('/_all_dbs');
  }
});

FauxtonAPI.registerUrls('databaseBaseURL', {
  server: function (database) {
    return Helpers.getServerUrl('/' + app.utils.safeURLName(database));
  },
  apiurl: function(database) {
    return Helpers.getApiUrl('/' + app.utils.safeURLName(database));
  },
  app: function (database) {
    return '/database/' + database;
  }
});

FauxtonAPI.registerUrls('permissions', {
  server: function (db) {
    return Helpers.getServerUrl('/' + db + '/_security');
  },

  app: function (db, partitionKey) {
    return '/database/' + db + partitionUrlComponent(partitionKey) + '/permissions';
  },

  apiurl: function (db) {
    return Helpers.getApiUrl('/' + db + '/_security');
  }
});

export default Databases;
