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
import ActionTypes from "./actiontypes";
import { has, sortBy, isUndefined } from 'lodash';

const initialState = {
  isLoading: false,
  sortByHeader: 'started-on',
  headerIsAscending: true,
  selectedRadio: 'All Tasks',
  searchTerm: '',
  tasks: [],
  filteredTasks: []
};

const sortTasksByColumnHeader = (colName, tasks, headerIsAscending) => {
  var sorted = sortBy(tasks, (item) => {
    var variable = colName;

    if (isUndefined(item[variable])) {
      variable = 'source';
    }
    return item[variable];
  });

  if (!headerIsAscending) {
    return sorted.reverse();
  }

  return sorted;
};


const setSearchTerm = (state, searchTerm) => {
  const filteredTasks = filterTasks(searchTerm, state.selectedRadio, state.sortbyHeader, state.tasks, state.headerIsAscending);
  return {
    ...state,
    filteredTasks,
    searchTerm
  };
};

const passesSearchFilter = (item, searchTerm) => {
  const regex = new RegExp(searchTerm, 'g');
  let itemDatabasesTerm = '';
  if (has(item, 'database')) {
    itemDatabasesTerm += item.database;
  }
  if (has(item, 'source')) {
    itemDatabasesTerm += item.source;
  }
  if (has(item, 'target')) {
    itemDatabasesTerm += item.target;
  }

  return regex.test(itemDatabasesTerm);
};

const passesRadioFilter = (item, selectedRadio) => {
  const fixedSelectedRadio = selectedRadio.toLowerCase().replace(' ', '_');
  return item.type ===  fixedSelectedRadio ||  fixedSelectedRadio === 'all_tasks';
};

const filterTasks = (searchTerm, selectedRadio, sortByHeader, tasks, headerIsAscending) => {
  const filtered = tasks.filter(task => {
    return passesRadioFilter(task, selectedRadio) && passesSearchFilter(task, searchTerm);
  });

  return sortTasksByColumnHeader(sortByHeader, filtered, headerIsAscending);
};

const setHeaderIsAscending = (prevSortbyHeader, sortByHeader, headerIsAscending) => {
  if (prevSortbyHeader === sortByHeader) {
    return !headerIsAscending;
  }

  return true;
};

export default (state = initialState, {type, options}) => {
  switch (type) {
    case ActionTypes.ACTIVE_TASKS_FETCH_AND_SET:
      return {
        ...state,
        tasks: options,
        filteredTasks: filterTasks(state.searchTerm, state.selectedRadio, state.sortByHeader, options, state.headerIsAscending)
      };

    case ActionTypes.ACTIVE_TASKS_SWITCH_TAB:
      const filteredTasks = filterTasks(state.searchTerm, options, state.sortByHeader, state.tasks, headerIsAscending);
      return {
        ...state,
        selectedRadio: options,
        filteredTasks
      };

    case ActionTypes.ACTIVE_TASKS_CHANGE_POLLING_INTERVAL:
      return {
        ...state,
        pollingIntervalSeconds: options
      };

    case ActionTypes.ACTIVE_TASKS_SET_SEARCH_TERM:
      return setSearchTerm(state, options);

    case ActionTypes.ACTIVE_TASKS_SORT_BY_COLUMN_HEADER:
      const prevSortbyHeader = state.sortByHeader;
      const sortByHeader = options;
      const headerIsAscending = setHeaderIsAscending(prevSortbyHeader, sortByHeader, state.headerIsAscending);
      const headerFilteredTasks = filterTasks(state.searchTerm, state.selectedRadio, sortByHeader, state.tasks, headerIsAscending);
      return {
        ...state,
        sortByHeader,
        headerIsAscending,
        filteredTasks: headerFilteredTasks
      };

    case ActionTypes.ACTIVE_TASKS_SET_IS_LOADING:
      return {
        ...state,
        isLoading: options
      };
  }
  return state;
};

export const getTasks = (state) => state.filteredTasks;
export const getHeaderIsAscending = (state) => state.headerIsAscending;
export const getIsLoading = (state) => state.isLoading;
export const getSelectedRadio = (state) => state.selectedRadio;
export const getSortByHeader = (state) => state.sortByHeader;
export const getSearchTerm = (state) => state.searchTerm;
