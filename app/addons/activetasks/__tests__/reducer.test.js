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

import reducer from '../reducers';
import ActionTypes from '../actiontypes';
import fakedResponse from "./fakeActiveTaskResponse";

describe('Active Tasks -- Stores', () => {
  let initState;

  beforeEach(() => {
    initState = reducer(undefined, {
      type: ActionTypes.ACTIVE_TASKS_FETCH_AND_SET,
      options: fakedResponse
    });
  });

  describe('Active Task Stores - Filter Tab Tray', () => {

    it('should filter the table correctly, by radio -- All Tasks', () => {
      const state = reducer(initState, {
        type: ActionTypes.ACTIVE_TASKS_SWITCH_TAB,
        options: 'all_tasks'
      });
      expect(state.tasks.length).toBeGreaterThan(0);
      expect(state.tasks.length).toEqual(state.filteredTasks.length);
    });

    it('should filter the table correctly, by radio', () => {
      const state = reducer(initState, {
        type: ActionTypes.ACTIVE_TASKS_SWITCH_TAB,
        options: 'replication'
      });

      //parse table and check that it only contains objects with type: Replication
      expect(state.filteredTasks.length > 0).toBeTruthy();
      state.filteredTasks.forEach(task => {
        expect(task.type).toEqual('replication');
        expect(task.type).toEqual(state.selectedRadio);
      });
    });

    it('should search the table correctly', () => {
      var searchTerm = 'base';
      const state = reducer(initState, {
        type: ActionTypes.ACTIVE_TASKS_SET_SEARCH_TERM,
        options: searchTerm
      });

      const fakeFilteredTable = [
        { user: 'information'},
        { user: 'ooo'}
      ];

      expect(fakeFilteredTable[0].user).toBe(state.filteredTasks[0].user);
      expect(fakeFilteredTable[1].user).toBe(state.filteredTasks[1].user);
    });
  });

  describe('Active Task Stores - Table Header Sort - Select Ascending/Descending', () => {

    it('should set header as ascending, on default', () => {
      const state = reducer(initState, {
        type: ActionTypes.ACTIVE_TASKS_SWITCH_TAB,
        options: 'all_tasks'
      });
      expect(state.headerIsAscending).toBeTruthy();
    });

    it('should set header as descending, if same header is selected again', () => {
      const state = reducer(initState, {
        type: ActionTypes.ACTIVE_TASKS_SORT_BY_COLUMN_HEADER,
        options: 'sameHeader'
      });
      expect(state.headerIsAscending).toBeTruthy();

      const state2 = reducer(state, {
        type: ActionTypes.ACTIVE_TASKS_SORT_BY_COLUMN_HEADER,
        options: 'sameHeader'
      });
      expect(state2.headerIsAscending).toBeFalsy();

      const state3 = reducer(state2, {
        type: ActionTypes.ACTIVE_TASKS_SORT_BY_COLUMN_HEADER,
        options: 'sameHeader'
      });
      expect(state3.headerIsAscending).toBeTruthy();

      const state4 = reducer(state3, {
        type: ActionTypes.ACTIVE_TASKS_SORT_BY_COLUMN_HEADER,
        options: 'differentHeader'
      });
      expect(state4.headerIsAscending).toBeTruthy();
    });
  });
});
