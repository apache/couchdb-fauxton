
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
import { get } from '../../../core/ajax';
import ActionTypes from './actiontypes';
import Helpers from '../helpers';

const pollingTimeout = 60000;
let currentRequest;

const addFilter = (filter) => (dispatch) => {
  dispatch({
    type: ActionTypes.ADD_CHANGES_FILTER_ITEM,
    filter: filter
  });
};

const removeFilter = (filter) => (dispatch) => {
  dispatch({
    type: ActionTypes.REMOVE_CHANGES_FILTER_ITEM,
    filter: filter
  });
};

const loadChanges = (databaseName) => (dispatch) => {
  currentRequest = null;
  getLatestChanges(dispatch, databaseName);
};

const getLatestChanges = (dispatch, databaseName, lastSeqNum) => {
  const params = {
    limit: 100
  };

  // after the first request for the changes list has been made, switch to longpoll
  if (currentRequest) {
    params.since = lastSeqNum;
    params.timeout = pollingTimeout;
    params.feed = 'longpoll';
  }

  const query = app.utils.queryParams(params);
  const db = app.utils.safeURLName(databaseName);
  const endpoint = FauxtonAPI.urls('changes', 'server', db, '?' + query);
  get(endpoint).then((res) => {
    if (res.error) {
      throw new Error(res.reason || res.error);
    }
    updateChanges(res, dispatch);
  }).catch((err) => {
    FauxtonAPI.addNotification({
      msg: 'Error loading list of changes. Reason: ' + err.message,
      type: 'error',
      clear: true
    });
  });
};

const updateChanges = (json, dispatch) => {
  const latestSeqNum = Helpers.getSeqNum(json.last_seq);
  dispatch({
    type: ActionTypes.UPDATE_CHANGES,
    changes: json.results,
    seqNum: latestSeqNum
  });
};

export default {
  addFilter,
  removeFilter,
  loadChanges
};
