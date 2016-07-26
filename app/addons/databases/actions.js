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
import Stores from "./stores";
import ActionTypes from "./actiontypes";
import Resources from "./resources";

export default {

  init: function (databases) {
    var params = app.getParams();
    var page = params.page ? parseInt(params.page, 10) : 1;
    var perPage = FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;

    this.setStartLoading();
    FauxtonAPI.when(databases.fetch({ cache: false })).then(function () {

      // if there are no databases, publish the init message anyway
      if (!databases.paginated(page, perPage).length) {
        FauxtonAPI.dispatch({
          type: ActionTypes.DATABASES_INIT,
          options: {
            collection: [],
            backboneCollection: databases,
            page: page
          }
        });
      }

      var numComplete = 0;
      _.each(databases.paginated(page, perPage), function (db) {
        db.status.fetchOnce().always(function () {
          numComplete++;
          if (numComplete < databases.paginated(page, perPage).length) {
            return;
          }
          FauxtonAPI.dispatch({
            type: ActionTypes.DATABASES_INIT,
            options: {
              collection: databases.paginated(page, perPage),
              backboneCollection: databases,
              page: page
            }
          });
        });
      });
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
    if (_.isNull(databaseName) || databaseName.trim().length === 0) {
      FauxtonAPI.addNotification({
        msg: 'Please enter a valid database name',
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
      var url = FauxtonAPI.urls('allDocs', 'app', app.utils.safeURLName(databaseName), '');
      // use the next cpu tick to allow react-select to unmount prorperly
      return setTimeout(() => { FauxtonAPI.navigate(url); });
    }

    FauxtonAPI.addNotification({
      msg: 'Database does not exist.',
      type: 'error'
    });
  }
};
