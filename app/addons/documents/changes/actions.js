
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

import app from "../../../app";
import FauxtonAPI from "../../../core/api";
import ActionTypes from "./actiontypes";
import Stores from "./stores";
import Helpers from "../helpers";

const changesStore = Stores.changesStore;
const pollingTimeout = 60000;
var currentRequest;


export default {
  addFilter: function (filter) {
    FauxtonAPI.dispatch({
      type: ActionTypes.ADD_CHANGES_FILTER_ITEM,
      filter: filter
    });
  },

  removeFilter: function (filter) {
    FauxtonAPI.dispatch({
      type: ActionTypes.REMOVE_CHANGES_FILTER_ITEM,
      filter: filter
    });
  },

  initChanges: function (options) {
    FauxtonAPI.dispatch({
      type: ActionTypes.INIT_CHANGES,
      options: options
    });
    currentRequest = null;
    this.getLatestChanges();
  },

  getLatestChanges: function () {
    const params = {
      limit: 100
    };

    // after the first request for the changes list has been made, switch to longpoll
    if (currentRequest) {
      params.since = changesStore.getLastSeqNum();
      params.timeout = pollingTimeout;
      params.feed = 'longpoll';
    }

    const query = $.param(params);
    const db = app.utils.safeURLName(changesStore.getDatabaseName());
    const endpoint = FauxtonAPI.urls('changes', 'server', db, '?' + query);
    currentRequest = $.getJSON(endpoint);
    currentRequest.then(this.updateChanges.bind(this));
  },

  updateChanges: function (json) {
    // only bother updating the list of changes if the seq num has changed
    const latestSeqNum = Helpers.getSeqNum(json.last_seq);
    if (latestSeqNum !== changesStore.getLastSeqNum()) {
      FauxtonAPI.dispatch({
        type: ActionTypes.UPDATE_CHANGES,
        changes: json.results,
        seqNum: latestSeqNum
      });
    }
  }
};
