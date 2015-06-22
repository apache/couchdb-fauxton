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
  'addons/documents/queryoptions/actiontypes'
],

function (app, FauxtonAPI, ActionTypes) {
  var Stores = {};

  Stores.QueryOptionsStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this.reset();
    },

    reset: function () {
      this._loading = true;
      this._showByKeys = false;
      this._showBetweenKeys = false;
      this._includeDocs = false;
      this._betweenKeys = {
        include: true,
      };

      this._byKeys = '';
      this._updateSeq = false;
      this._descending = false;
      this._skip = '';
      this._limit = "none";
      this._reduce = false;
      this._groupLevel = 'exact';

      this._showReduce = false;
      this._showStale = false;
    },

    isLoading: function () {
      return this._loading;
    },

    isVisible: function () {
      return true;
    },

    showReduce: function () {
      return this._showReduce;
    },

    reduce: function () {
      return this._reduce;
    },

    showStale: function () {
      return this._showStale;
    },

    betweenKeys: function () {
      return this._betweenKeys;
    },

    updateBetweenKeys: function (newBetweenKeys) {
      this._betweenKeys = newBetweenKeys;
    },

    updateSkip: function (skip) {
      this._skip = skip;
    },

    skip: function () {
      return this._skip;
    },

    limit: function () {
      return this._limit;
    },

    updateLimit: function (limit) {
      this._limit = limit;
    },

    byKeys: function () {
      return this._byKeys;
    },

    updateByKeys: function (keys) {
      this._byKeys = keys;
    },

    includeDocs: function () {
      return this._includeDocs;
    },

    updateSeq: function () {
      return this._updateSeq;
    },

    descending: function () {
      return this._descending;
    },

    groupLevel: function () {
      return this._groupLevel;
    },

    toggleByKeys: function () {
      this._showByKeys = !this._showByKeys;

      if (this._showByKeys) {
        this._showBetweenKeys = false;
      }
    },

    toggleBetweenKeys: function () {
      this._showBetweenKeys = !this._showBetweenKeys;

      if (this._showBetweenKeys) {
        this._showByKeys = false;
      }
    },

    showByKeys: function () {
      return this._showByKeys;
    },

    showBetweenKeys: function () {
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

      if (params.start_key) {
        var include = true;

        if (params.inclusive_end) {
          include = params.inclusive_end === "true" ? true : false;
        }

        this._betweenKeys = {
          startkey: JSON.parse(params.start_key),
          endkey: JSON.parse(params.end_key),
          include: include
        };

        this._showBetweenKeys = true;
      } else if (params.keys) {
        this._byKeys = params.keys;
        this._showByKeys = true;
      }

      if (params.update_seq) {
        this._updateSeq = params.update_seq;
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

    getQueryParams: function () {
      var params = {};

      if (this._includeDocs) {
        params.include_docs = this._includeDocs;
      }

      if (this._showBetweenKeys) {
        var betweenKeys = this._betweenKeys;
        _.extend(params, {
          inclusive_end: betweenKeys.include,
          start_key: JSON.stringify(betweenKeys.startkey),
          end_key: JSON.stringify(betweenKeys.endkey)
        });

      } else if (this._showByKeys) {
        params.keys = this._byKeys;
      }

      if (this._updateSeq) {
        params.update_seq = this._updateSeq;
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

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.QUERY_RESET:
          this.setQueryParams(action.params);
          this.triggerChange();
        break;
        case ActionTypes.QUERY_TOGGLE_INCLUDE_DOCS:
          this._includeDocs = !this._includeDocs;
          this.triggerChange();
        break;
        case ActionTypes.QUERY_TOGGLE_UPDATE_SEQ:
          this._updateSeq = !this._updateSeq;
          this.triggerChange();
        break;
        case ActionTypes.QUERY_TOGGLE_DESCENDING:
          this._descending = !this._descending;
          this.triggerChange();
        break;
        case ActionTypes.QUERY_TOGGLE_BY_KEYS:
          this.toggleByKeys();
          this.triggerChange();
        break;
        case ActionTypes.QUERY_TOGGLE_BETWEEN_KEYS:
          this.toggleBetweenKeys();
          this.triggerChange();
        break;
        case ActionTypes.QUERY_UPDATE_BETWEEN_KEYS:
          this.updateBetweenKeys(action.betweenKeys);
          this.triggerChange();
        break;
        case ActionTypes.QUERY_UPDATE_BY_KEYS:
          this.updateByKeys(action.byKeys);
          this.triggerChange();
        break;
        case ActionTypes.QUERY_UPDATE_SKIP:
          this.updateSkip(action.skip);
          this.triggerChange();
        break;
        case ActionTypes.QUERY_UPDATE_LIMIT:
          this.updateLimit(action.limit);
          this.triggerChange();
        break;
        case ActionTypes.QUERY_SHOW_REDUCE:
          this._showReduce = true;
          this.triggerChange();
        break;
        case ActionTypes.QUERY_TOGGLE_REDUCE:
          this._reduce = !this._reduce;
          this.triggerChange();
        break;
        case ActionTypes.QUERY_SHOW_STALE:
          this._showStale = true;
          this.triggerChange();
        break;
        case ActionTypes.QUERY_UPDATE_GROUP_LEVEL:
          this.updateGroupLevel(action.groupLevel);
          this.triggerChange();
        break;
        default:
        return;
        // do nothing
      }
    }
  });

  Stores.queryOptionsStore = new Stores.QueryOptionsStore();
  Stores.queryOptionsStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.queryOptionsStore.dispatch);

  return Stores;

});
