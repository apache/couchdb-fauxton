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
  "../../core/api"
],

function (app, FauxtonAPI) {
  var Replication = {};

  // these are probably dupes from the database modules. I'm going to keep them separate for now
  Replication.DBModel = Backbone.Model.extend({
    label: function () {
      // for autocomplete
      return this.get('name');
    }
  });

  Replication.DBList = Backbone.Collection.extend({
    model: Replication.DBModel,
    url: function () {
      return app.host + '/_all_dbs';
    },
    parse: function (resp) {
      // TODO: pagination!
      return _.map(resp, function (database) {
        return {
          id: database,
          name: database
        };
      });
    }
  });

  Replication.Task = Backbone.Model.extend({});

  Replication.Tasks = Backbone.Collection.extend({
    model: Replication.Task,
    url: function () {
      return app.host + '/_active_tasks';
    },
    parse: function (resp) {
      //only want replication tasks to return
      return _.filter(resp, function (task) {
        return task.type === 'replication';
      });
    }
  });

  Replication.Replicate = Backbone.Model.extend({
    documentation: FauxtonAPI.constants.DOC_URLS.REPLICATION,
    url: function () {
      return window.location.origin + '/_replicate';
    }
  });

  return Replication;
});
