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

function getDatabaseDetails (dbList, fullDbList) {
  const databaseDetails = [];
  const failedDbs = [];
  let seen = 0;

  dbList.forEach((db) => {
    const url = FauxtonAPI.urls('databaseBaseURL', 'server', db);

    fetch(url)
      .then((res) => {
        databaseDetails.push(res);
      })
      .fail(() => {
        failedDbs.push(db);
      })
      .always(() => {
        seen++;

        if (seen !== dbList.length) {
          return;
        }

        updateDatabases({
          dbList: dbList,
          databaseDetails: databaseDetails,
          failedDbs: failedDbs,
          fullDbList: fullDbList
        });
      });
  });
}

function fetch (url) {
  return $.ajax({
    cache: false,
    url: url,
    dataType: 'json'
  }).then((res) => {
    return res;
  });
}

function getDatabaseList () {
  const url = FauxtonAPI.urls('allDBs', 'server');

  return fetch(url);
}

function paginate (list, page, perPage) {
  const start = (page - 1) * perPage;
  const end = page * perPage;
  return list.slice(start, end);
}

function updateDatabases (options) {
  FauxtonAPI.dispatch({
    type: ActionTypes.DATABASES_UPDATE,
    options: options
  });
}

export default {
  getDatabaseList: getDatabaseList,
  paginate: paginate,
  getDatabaseDetails: getDatabaseDetails,
  fetch: fetch,

  init: function () {
    const params = app.getParams();
    const page = params.page ? parseInt(params.page, 10) : 1;
    const limit = FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;

    this.setStartLoading();

    this.setPage(page);

    getDatabaseList(limit, page)
      .then((fullDbList) => {
        const paginatedDbList = paginate(fullDbList, page, limit);

        this.updateDatabases({
          dbList: paginatedDbList,
          databaseDetails: [],
          failedDbs: [],
          fullDbList: fullDbList
        });

        getDatabaseDetails(paginatedDbList, fullDbList);
      });
  },

  updateDatabases,

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
    ).fail(function (xhr) {
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

    const url = FauxtonAPI.urls('allDocs', 'app', app.utils.safeURLName(databaseName), '');
    // use the next cpu tick to allow react-select to unmount prorperly
    return setTimeout(() => { FauxtonAPI.navigate(url); });
  },

  fetchAllDbsWithKey: (id, callback) => {
    const query = '?' + $.param({
      startkey: JSON.stringify(id),
      endkey: JSON.stringify(id + "\u9999"),
      limit: 30
    });

    const url = `${app.host}/_all_dbs${query}`;
    $.ajax({
      cache: false,
      url: url,
      dataType: 'json'
    }).then((dbs) => {
      const options = dbs.map(db => {
        return {
          value: db,
          label: db
        };
      });
      callback(null, {
        options: options
      });
    });
  }
};
