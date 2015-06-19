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
  'addons/databases/stores',
  'addons/databases/actiontypes',
  'addons/databases/resources'
],
function (app, FauxtonAPI, Stores, ActionTypes, Resources) {
  return {

    init: function (databases) {
      var params = app.getParams();
      var page = params.page ? parseInt(params.page, 10) : 1;
      var perPage = FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;

      this.setStartLoading();
      FauxtonAPI.when(databases.fetch({ cache: false })).then(function () {
        FauxtonAPI.when(databases.paginated(page, perPage).map(function (database) {
          return database.status.fetchOnce();
        })).always(function () {
          //make this always so that even if a user is not allowed access to a database
          //they will still see a list of all databases
          FauxtonAPI.dispatch({
            type: ActionTypes.DATABASES_INIT,
            options: {
              collection: databases.paginated(page, perPage),
              backboneCollection: databases,
              page: page
            }
          });
        }.bind(this));
      }.bind(this));
    },

    setPage: function (page) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATABASES_SETPAGE,
        options: {
          page: page
        }
      });
    },

    setStartLoading: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATABASES_STARTLOADING
      });
    },

    setLoadComplete: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATABASES_LOADCOMPLETE
      });
    },

    createNewDatabase: function (databaseName) {
      if (_.isNull(databaseName) || databaseName.trim().length === 0 || !this.isValidDatabaseName(databaseName)) {
        FauxtonAPI.addNotification({
          msg: 'Please enter a valid database name. The database must start with a letter and can only contain lowercase letters (a-z), digits (0-9) and the following characters _, $, (, ), +, -, and /.',
          type: 'error',
          clear: true
        });
        return;
      }
      databaseName = databaseName.trim();
      // name accepted, make sure prompt can be removed
      FauxtonAPI.dispatch({
        type: ActionTypes.DATABASES_SET_PROMPT_VISIBLE,
        options: {
          visible: false
        }
      });

      var db = Stores.databasesStore.obtainNewDatabaseModel(databaseName);
      FauxtonAPI.addNotification({ msg: 'Creating database.' });
      db.save().done(function () {
          FauxtonAPI.addNotification({
            msg: 'Database created successfully',
            type: 'success',
            clear: true
          });
          var route = FauxtonAPI.urls('allDocs', 'app', app.utils.safeURLName(databaseName), '?limit=' + Resources.DocLimit);
          app.router.navigate(route, { trigger: true });
        }
      ).error(function (xhr) {
          var responseText = JSON.parse(xhr.responseText).reason;
          FauxtonAPI.addNotification({
            msg: 'Create database failed: ' + responseText,
            type: 'error',
            clear: true
          });
        }
      );
    },

    jumpToDatabase: function (databaseName) {
      if (_.isNull(databaseName) || databaseName.trim().length === 0) {
        return;
      }
      databaseName = databaseName.trim();
      if (Stores.databasesStore.doesDatabaseExist(databaseName)) {
        var url = FauxtonAPI.urls('allDocs', 'app', app.utils.safeURLName(databaseName), "");
        FauxtonAPI.navigate(url);
      } else {
        FauxtonAPI.addNotification({
          msg: 'Database does not exist.',
          type: 'error'
        });
      }
    },

    isValidDatabaseName: function (databaseName) {
      return (/^[a-z][a-z0-9_\$\(\)\+\/-]*$/).test(databaseName);
    }
  };
});
