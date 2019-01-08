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
import app from '../../app';
import Helpers from '../../helpers';
import FauxtonAPI from '../../core/api';
import { get } from '../../core/ajax';
import DatabasesBase from '../databases/base';
import Stores from './stores';
import ActionTypes from './actiontypes';
import * as API from './api';

function getDatabaseDetails (dbList, fullDbList) {
  const databaseDetails = [];
  const failedDbs = [];
  let seen = 0;

  dbList.forEach((db) => {
    const url = FauxtonAPI.urls('databaseBaseURL', 'server', db);

    fetch(url)
      .then((res) => {
        databaseDetails.push(res);
      }).catch(() => {
        failedDbs.push(db);
      }).then(() => {
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
  return get(url).then(res => {
    if (res.error) {
      throw new Error(res.reason || res.error);
    }
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
  getDatabaseList,
  paginate,
  getDatabaseDetails,
  fetch,
  updateDatabases,

  init({page, limit}) {
    this.setStartLoading();
    this.setPage(page);
    if (limit) {
      this.setLimit(limit);
    }

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

  setPage(page) {
    FauxtonAPI.dispatch({
      type: ActionTypes.DATABASES_SETPAGE,
      options: {
        page
      }
    });
  },

  setLimit(limit) {
    FauxtonAPI.dispatch({
      type: ActionTypes.DATABASES_SETLIMIT,
      options: {
        limit
      }
    });
  },

  setStartLoading() {
    FauxtonAPI.dispatch({
      type: ActionTypes.DATABASES_STARTLOADING
    });
  },

  setLoadComplete() {
    FauxtonAPI.dispatch({
      type: ActionTypes.DATABASES_LOADCOMPLETE
    });
  },

  createNewDatabase(databaseName, partitioned) {
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

    const db = Stores.databasesStore.obtainNewDatabaseModel(databaseName, partitioned);
    FauxtonAPI.addNotification({ msg: 'Creating database.' });
    db.save().done(() => {
      FauxtonAPI.addNotification({
        msg: 'Database created successfully',
        type: 'success',
        clear: true
      });
      const route = FauxtonAPI.urls('allDocs', 'app', app.utils.safeURLName(databaseName));
      app.router.navigate(route, { trigger: true });
    }
    ).fail((xhr) => {
      const responseText = JSON.parse(xhr.responseText).reason;
      FauxtonAPI.addNotification({
        msg: 'Create database failed: ' + responseText,
        type: 'error',
        clear: true
      });
    }
    );
  },

  jumpToDatabase(databaseName) {
    if (_.isNull(databaseName) || databaseName.trim().length === 0) {
      return;
    }

    databaseName = databaseName.trim();

    const url = FauxtonAPI.urls('allDocs', 'app', app.utils.safeURLName(databaseName), '');
    // use the next cpu tick to allow react-select to unmount prorperly
    return setTimeout(() => { FauxtonAPI.navigate(url); });
  },

  fetchAllDbsWithKey(id, callback) {
    const query = '?' + app.utils.queryParams({
      startkey: JSON.stringify(id),
      endkey: JSON.stringify(id + '\u9999'),
      limit: 30
    });

    const url = Helpers.getServerUrl(`/_all_dbs${query}`);
    get(url).then((dbs) => {
      const options = dbs.map(db => {
        return {
          value: db,
          label: db
        };
      });
      callback(null, { options: options });
    });
  },

  setPartitionedDatabasesAvailable(available) {
    const action = {
      type: ActionTypes.DATABASES_PARTITIONED_DB_AVAILABLE,
      options: {
        available
      }
    };
    FauxtonAPI.dispatch(action);
    FauxtonAPI.reduxDispatch(action);
  },

  checkPartitionedQueriesIsAvailable() {
    const exts = FauxtonAPI.getExtensions(DatabasesBase.PARTITONED_DB_CHECK_EXTENSION);
    let promises = exts.map(checkFunction => {
      return checkFunction();
    });
    FauxtonAPI.Promise.all(promises).then(results => {
      const isAvailable = results.every(check => check === true);
      this.setPartitionedDatabasesAvailable(isAvailable);
    }).catch(() => {
      // ignore as the default is false
    });
  },

  // Fetches and sets metadata info for the selected database, which is defined by the current URL
  // This function is intended to be called by the routers if needed by the components in the page.
  fetchSelectedDatabaseInfo(databaseName) {
    FauxtonAPI.reduxDispatch({
      type: ActionTypes.DATABASES_FETCH_SELECTED_DB_METADATA
    });
    API.fetchDatabaseInfo(databaseName).then(res => {
      if (!res.db_name) {
        const details = res.reason ? res.reason : '';
        throw new Error('Failed to fetch database info. ' + details);
      }
      FauxtonAPI.reduxDispatch({
        type: ActionTypes.DATABASES_FETCH_SELECTED_DB_METADATA_SUCCESS,
        options: {
          metadata: res
        }
      });
    }).catch(err => {
      FauxtonAPI.addNotification({
        msg: err.message,
        type: 'error',
        clear: true
      });
    });
  }
};
