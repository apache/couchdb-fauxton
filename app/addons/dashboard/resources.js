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
  'addons/databases/resources'
],
function (app, FauxtonAPI, Databases) {
  var Dashboard = {};

  Dashboard.AllTasks = Backbone.Collection.extend({

    url: function () {
      return app.host + '/_active_tasks';
    },

    pollingFetch: function () { //still need this for the polling
      return this.fetch({reset: true, parse: true});
    },

    parse: function (resp) {
      //no more backbone models, collection is converted into an array of objects
      var collectionTable = [];

      _.each(resp, function (item) {

        var source = this.parseDbName(item.source);
        var target = this.parseDbName(item.target);
        var s_helper = new Dashboard.SourceDatabaseInfo(source);
        var t_helper = new Dashboard.TargetDatabaseInfo(target);

        s_helper.fetch();
        t_helper.fetch();

        collectionTable.push(_.extend(item, {
          sourceTotDocs: s_helper,
          targetTotDocs: t_helper
        }));

      }.bind(this));

      //collection is an array of objects
      this.table = collectionTable;
      return resp;
    },

    table: [],

    parseDbName: function (databaseURL) {
      if (databaseURL.includes("http://")) {
        return databaseURL.split('/')[3];
      } else {
        return databaseURL;
      }
    }

  });

  Dashboard.DatabaseList = FauxtonAPI.Model.extend({

    initialize: function (options) {
      this.database = options.database;
    },

    url: function () {
      return app.host + '/' + this.database + '/_all_docs';
    }

  });

  Dashboard.SourceDatabaseInfo = Databases.Model.extend({
    initialize: function (sourceDB) {
      this.id = sourceDB;
    },

    url: function () {
      return app.host + "/" + this.id;
    },

    parse: function (resp) {
      this.sourceTotalDocs = resp.doc_count;
    },

    sourceTotalDocs: 0
  });

  Dashboard.TargetDatabaseInfo = FauxtonAPI.Model.extend({
    initialize: function (targetDB) {
      this.id = targetDB;
    },

    url: function () {
      return app.host + "/" + this.id;
    },

    parse: function (resp) {
      this.targetTotalDocs = resp.doc_count;
    },

    targetTotalDocs: 0
  });

  return Dashboard;
});
