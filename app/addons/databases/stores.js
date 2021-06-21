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
import FauxtonAPI from "../../core/api";
import ActionTypes from "./actiontypes";
import Resources from "./resources";
import Helpers from "../../helpers";

function loadDatabasesPerPage() {
  let dbsPerPage = app.utils.localStorageGet('fauxton:dbs_per_page');
  if (!dbsPerPage) {
    dbsPerPage = FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;
  }
  return dbsPerPage;
}

const Database = Resources.Model;

const DatabasesStoreConstructor = FauxtonAPI.Store.extend({

  initialize: function () {
    this.reset();
  },

  reset: function () {
    this._loading = false;
    this._promptVisible = false;
    this._page = 1;
    this._limit = loadDatabasesPerPage();

    this._dbList = [];
    this._databaseDetails = [];
    this._failedDbs = [];
    this._fullDbList = [];

    this._partitionedDatabasesAvailable = false;
  },

  getPage: function () {
    return this._page;
  },

  getLimit: function () {
    return this._limit;
  },

  setLimit: function (limit) {
    this._limit = limit;
    app.utils.localStorageSet('fauxton:dbs_per_page', limit);
  },

  isLoading: function () {
    return this._loading;
  },

  setLoading: function (loading) {
    this._loading = loading;
  },

  isPromptVisible: function () {
    return this._promptVisible;
  },

  setPromptVisible: function (promptVisible) {
    this._promptVisible = promptVisible;
  },

  obtainNewDatabaseModel: function (databaseName, partitioned) {
    const dbModel = new Database({
      id: databaseName,
      name: databaseName
    });
    dbModel.setPartitioned(partitioned);
    return dbModel;
  },

  doesDatabaseExist: function (databaseName) {
    return this._dbList.indexOf(databaseName) !== -1;
  },

  getTotalAmountOfDatabases: function () {
    return this._fullDbList.length;
  },

  getDbList: function () {
    return this._dbList.map((db) => {

      const allDetails = this._databaseDetails.filter((el) => { return el.db_name === db; });
      const data = {
        id: db,
        encodedId: encodeURIComponent(db),
        url: FauxtonAPI.urls('allDocsSanitized', 'app', db),
        failed: this._failedDbs.indexOf(db) !== -1
      };

      const res = Object.assign({}, data, this._getDetails(allDetails[0]));
      return res;
    });
  },

  _getDetails: function (details) {
    if (!details) {
      return {};
    }

    const sizeReporter = FauxtonAPI.getExtensions('DatabaseList:dbSizeReportFieldName');
    let fieldName = 'active';
    if (sizeReporter.length > 0) {
      fieldName = sizeReporter[0];
    }

    const {sizes} = details;
    const dataSize = (sizes && sizes[fieldName]) || (sizes && sizes.active) || (sizes && sizes.external) || details.data_size || 0;

    return {
      dataSize: Helpers.formatSize(dataSize),
      docCount: details.doc_count,
      docDelCount: details.doc_del_count,
      showTombstoneWarning: details.doc_del_count > details.doc_count,
      isPartitioned: details.props && details.props.partitioned === true
    };
  },

  isPartitionedDatabasesAvailable: function () {
    return this._partitionedDatabasesAvailable;
  },

  dispatch: function (action) {
    switch (action.type) {
      case ActionTypes.DATABASES_SETPAGE:
        this._page = action.options.page;
        break;

      case ActionTypes.DATABASES_SETLIMIT:
        this.setLimit(action.options.limit);
        break;

      case ActionTypes.DATABASES_SET_PROMPT_VISIBLE:
        this.setPromptVisible(action.options.visible);
        break;

      case ActionTypes.DATABASES_STARTLOADING:
        this.setLoading(true);
        break;

      case ActionTypes.DATABASES_LOADCOMPLETE:
        this.setLoading(false);
        break;

      case ActionTypes.DATABASES_UPDATE:
        this._fullDbList = action.options.fullDbList;
        this._dbList = action.options.dbList;
        this._databaseDetails = action.options.databaseDetails;
        this._failedDbs = action.options.failedDbs;
        this.setLoading(false);
        break;

      case ActionTypes.DATABASES_PARTITIONED_DB_AVAILABLE:
        this._partitionedDatabasesAvailable = action.options.available;
        break;

      default:
        return;
    }

    this.triggerChange();
  }
});

const databasesStore = new DatabasesStoreConstructor();
databasesStore.dispatchToken = FauxtonAPI.dispatcher.register(databasesStore.dispatch.bind(databasesStore));

export default {
  databasesStore: databasesStore,
  DatabasesStoreConstructor: DatabasesStoreConstructor
};
