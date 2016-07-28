
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

import FauxtonAPI from "../../../core/api";
import ActionTypes from "./actiontypes";
import Helpers from "../helpers";


var ChangesStore = FauxtonAPI.Store.extend({
  initialize: function () {
    this.reset();
  },

  reset: function () {
    this._isLoaded = false;
    this._filters = [];
    this._changes = [];
    this._databaseName = '';
    this._maxChangesListed = 100;
    this._showingSubset = false;
    this._lastSequenceNum = null;
  },

  initChanges: function (options) {
    this.reset();
    this._databaseName = options.databaseName;
  },

  isLoaded: function () {
    return this._isLoaded;
  },

  updateChanges: function (seqNum, changes) {

    // make a note of the most recent sequence number. This is used for a point of reference for polling for new changes
    this._lastSequenceNum = seqNum;

    // mark any additional changes that come after first page load as "new" so we can add a nice highlight effect
    // when the new row is rendered
    var firstBatch = this._changes.length === 0;
    _.each(this._changes, function (change) {
      change.isNew = false;
    });

    var newChanges = _.map(changes, function (change) {
      var seq = Helpers.getSeqNum(change.seq);
      return {
        id: change.id,
        seq: seq,
        deleted: _.has(change, 'deleted') ? change.deleted : false,
        changes: change.changes,
        doc: change.doc, // only populated with ?include_docs=true
        isNew: !firstBatch
      };
    });

    // add the new changes to the start of the list
    this._changes = newChanges.concat(this._changes);
    this._isLoaded = true;
  },

  getChanges: function () {
    this._showingSubset = false;
    var numMatches = 0;

    return _.filter(this._changes, function (change) {
      if (numMatches >= this._maxChangesListed) {
        this._showingSubset = true;
        return false;
      }
      var changeStr = JSON.stringify(change);
      var match = _.every(this._filters, function (filter) {
        return new RegExp(filter, 'i').test(changeStr);
      });

      if (match) {
        numMatches++;
      }
      return match;
    }, this);
  },

  addFilter: function (filter) {
    this._filters.push(filter);
  },

  removeFilter: function (filter) {
    this._filters = _.without(this._filters, filter);
  },

  getFilters: function () {
    return this._filters;
  },

  hasFilter: function (filter) {
    return _.contains(this._filters, filter);
  },

  getDatabaseName: function () {
    return this._databaseName;
  },

  isShowingSubset: function () {
    return this._showingSubset;
  },

  // added to speed up the tests
  setMaxChanges: function (num) {
    this._maxChangesListed = num;
  },

  getLastSeqNum: function () {
    return this._lastSequenceNum;
  },

  dispatch: function (action) {
    switch (action.type) {
      case ActionTypes.INIT_CHANGES:
        this.initChanges(action.options);
        break;

      case ActionTypes.UPDATE_CHANGES:
        this.updateChanges(action.seqNum, action.changes);
        break;

      case ActionTypes.ADD_CHANGES_FILTER_ITEM:
        this.addFilter(action.filter);
        break;

      case ActionTypes.REMOVE_CHANGES_FILTER_ITEM:
        this.removeFilter(action.filter);
        break;

      default:
        return;
    }

    this.triggerChange();
  }
});


var Stores = {};
Stores.changesStore = new ChangesStore();
Stores.changesStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.changesStore.dispatch);

export default Stores;
