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
import FauxtonAPI from '../../core/api';
import ActionTypes from "./actiontypes";
import fetchActiveTasks from './api';

export const setActiveTaskIsLoading = (boolean) => {
  return {
    type: ActionTypes.ACTIVE_TASKS_SET_IS_LOADING,
    options: boolean
  };
};

export const setActiveTasks = (tasks) => {
  return {
    type: ActionTypes.ACTIVE_TASKS_FETCH_AND_SET,
    options: tasks
  };
};

export const init = () => (dispatch) => {
  dispatch(setActiveTaskIsLoading(true));
  fetchActiveTasks()
    .then(tasks => {
      dispatch(setActiveTaskIsLoading(false));
      dispatch(setActiveTasks(tasks));
    })
    .catch(error => {
      FauxtonAPI.addNotification({
        msg: `Fetching active tasks failed: ${error}`,
        type: 'error'
      });
    });
};

export const switchTab = (tab) => {
  return {
    type: ActionTypes.ACTIVE_TASKS_SWITCH_TAB,
    options: tab
  };
};

export const setSearchTerm = (searchTerm) => {
  return {
    type: ActionTypes.ACTIVE_TASKS_SET_SEARCH_TERM,
    options: searchTerm
  };
};

export const sortByColumnHeader = (columnName) => {
  return {
    type: ActionTypes.ACTIVE_TASKS_SORT_BY_COLUMN_HEADER,
    options: columnName
  };
};

export const runPollingUpdate = () => (dispatch) => {
  fetchActiveTasks()
    .then(tasks => {
      dispatch(setActiveTasks(tasks));
    })
    .catch(error => {
      FauxtonAPI.addNotification({
        msg: `Fetching active tasks failed: ${error}`,
        type: 'error'
      });
    });
};
