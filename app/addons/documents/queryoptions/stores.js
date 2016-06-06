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

import app from '../../../app';

import FauxtonAPI from '../../../core/api';
import ActionTypes from './actiontypes';
const Stores = {};

Stores.QueryOptionsStore = FauxtonAPI.Store.extend({

  initialize () {
    this._trayVisible = false;
    this.reset();
  },

  reset () {
    this._isVisible = true;
    this._loading = true;
    this._showByKeys = false;
    this._showBetweenKeys = false;
    this._includeDocs = false;
    this._betweenKeys = {
      include: true
    };
    this._byKeys = '';
    this._descending = false;
    this._skip = '';
    this._limit = "none";
    this._reduce = false;
    this._groupLevel = 'exact';

    this._showReduce = false;
  },

  isLoading () {
    return this._loading;
  },

  isVisible () {
    return this._isVisible;
  },

  hideQueryOptions () {
    this._isVisible = false;
  },

  showQueryOptions () {
    this._isVisible = true;
  },

  setTrayVisible: function (trayVisible) {
    this._trayVisible = trayVisible;
  },

  getTrayVisible () {
    return this._trayVisible;
  },

  showReduce () {
    return this._showReduce;
  },

  reduce () {
    return this._reduce;
  },

  betweenKeys () {
    return this._betweenKeys;
  },

  updateBetweenKeys: function (newBetweenKeys) {
    this._betweenKeys = newBetweenKeys;
  },

  updateSkip: function (skip) {
    this._skip = skip;
  },

  skip () {
    return this._skip;
  },

  limit () {
    return this._limit;
  },

  updateLimit: function (limit) {
    this._limit = limit;
  },

  byKeys () {
    return this._byKeys;
  },

  updateByKeys: function (keys) {
    this._byKeys = keys;
  },

  includeDocs () {
    return this._includeDocs;
  },

  descending () {
    return this._descending;
  },

  groupLevel () {
    return this._groupLevel;
  },

  toggleByKeys () {
    this._showByKeys = !this._showByKeys;

    if (this._showByKeys) {
      this._showBetweenKeys = false;
    }
  },

  toggleBetweenKeys () {
    this._showBetweenKeys = !this._showBetweenKeys;

    if (this._showBetweenKeys) {
      this._showByKeys = false;
    }
  },

  showByKeys () {
    return this._showByKeys;
  },

  showBetweenKeys () {
    return this._showBetweenKeys;
  },

  updateGroupLevel: function (groupLevel) {
    this._groupLevel = groupLevel;
  },

  setQueryParams: function (params) {
    this.reset();
    if (params.include_docs) {
      this._includeDocs = true;
    }

    if (params.start_key || params.end_key) {
      let include = true;

      if (params.inclusive_end) {
        include = params.inclusive_end === 'true';
      }
      this._betweenKeys = { include: include };
      if (params.start_key) {
        this._betweenKeys.startkey = params.start_key;
      }
      if (params.end_key) {
        this._betweenKeys.endkey = params.end_key;
      }
      this._showBetweenKeys = true;

    } else if (params.keys) {
      this._byKeys = params.keys;
      this._showByKeys = true;
    }

    if (params.limit && params.limit !== 'none') {
      this._limit = params.limit;
    }

    if (params.skip) {
      this._skip = params.skip;
    }

    if (params.descending) {
      this._descending = params.descending;
    }

    if (params.reduce) {
      if (params.group) {
        this._groupLevel = 'exact';
      } else {
        this._groupLevel = params.group_level;
      }
      this._reduce = true;
    }
  },

  getQueryParams () {
    const params = {};

    if (this._includeDocs) {
      params.include_docs = this._includeDocs;
    }

    if (this._showBetweenKeys) {
      const betweenKeys = this._betweenKeys;
      params.inclusive_end = betweenKeys.include;
      if (betweenKeys.startkey && betweenKeys.startkey !== '') {
        params.start_key = betweenKeys.startkey;
      }
      if (betweenKeys.endkey && betweenKeys.endkey !== '') {
        params.end_key = betweenKeys.endkey;
      }
    } else if (this._showByKeys) {
      params.keys = this._byKeys.replace(/\r?\n/g, '');
    }

    if (this._limit !== 'none') {
      params.limit = parseInt(this._limit, 10);
    }

    if (this._skip) {
      params.skip = parseInt(this._skip, 10);
    }

    if (this._descending) {
      params.descending = this._descending;
    }

    if (this._reduce) {
      params.reduce = true;

      if (this._groupLevel === 'exact') {
        params.group = true;
      } else {
        params.group_level = this._groupLevel;
      }
    }

    return params;
  },

  getIncludeDocsEnabled () {
    return this._includeDocs;
  },

  dispatch: function (action) {
    switch (action.type) {
      case ActionTypes.QUERY_RESET:
        this.setQueryParams(action.params);
      break;
      case ActionTypes.QUERY_TOGGLE_INCLUDE_DOCS:
        this._includeDocs = !this._includeDocs;
      break;
      case ActionTypes.QUERY_TOGGLE_DESCENDING:
        this._descending = !this._descending;
      break;
      case ActionTypes.QUERY_TOGGLE_BY_KEYS:
        this.toggleByKeys();
      break;
      case ActionTypes.QUERY_TOGGLE_BETWEEN_KEYS:
        this.toggleBetweenKeys();
      break;
      case ActionTypes.QUERY_UPDATE_BETWEEN_KEYS:
        this.updateBetweenKeys(action.betweenKeys);
      break;
      case ActionTypes.QUERY_UPDATE_BY_KEYS:
        this.updateByKeys(action.byKeys);
      break;
      case ActionTypes.QUERY_UPDATE_SKIP:
        this.updateSkip(action.skip);
      break;
      case ActionTypes.QUERY_UPDATE_LIMIT:
        this.updateLimit(action.limit);
      break;
      case ActionTypes.QUERY_SHOW_REDUCE:
        this._showReduce = true;
      break;
      case ActionTypes.QUERY_TOGGLE_REDUCE:
        this._reduce = !this._reduce;
      break;
      case ActionTypes.QUERY_UPDATE_GROUP_LEVEL:
        this.updateGroupLevel(action.groupLevel);
      break;
      case ActionTypes.QUERY_UPDATE_VISIBILITY:
        this.setTrayVisible(action.options);
      break;
      case ActionTypes.QUERY_HIDE:
        this.hideQueryOptions();
      break;
      case ActionTypes.QUERY_SHOW:
        this.showQueryOptions();
      break;
      default:
      return;
      // do nothing
    }
    this.triggerChange();

  }
});

Stores.queryOptionsStore = new Stores.QueryOptionsStore();
Stores.queryOptionsStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.queryOptionsStore.dispatch);

export default Stores;
