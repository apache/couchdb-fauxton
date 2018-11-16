
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

import FauxtonAPI from '../../../core/api';
import ActionTypes from '../changes/actiontypes';
import reducer from '../changes/reducers';

FauxtonAPI.router = new FauxtonAPI.Router([]);

describe('Changes Reducer', () => {

  const changesList = [
    { id: 'doc_1', seq: 4, deleted: false, changes: { code: 'here' }, isNew: false },
    { id: 'doc_2', seq: 1, deleted: false, changes: { code: 'here' }, isNew: false },
    { id: 'doc_3', seq: 6, deleted: true, changes: { code: 'here' }, isNew: false },
    { id: 'doc_4', seq: 7, deleted: false, changes: { code: 'here' }, isNew: false },
    { id: 'doc_5', seq: 1, deleted: true, changes: { code: 'here' }, isNew: false }
  ];

  it('adds new filter to state', () => {
    const filter = 'My filter';
    const action = {
      type: ActionTypes.ADD_CHANGES_FILTER_ITEM,
      filter
    };
    const newState = reducer(undefined, action);

    expect(newState.filters.length).toBe(1);
    expect(newState.filters[0]).toBe(filter);
  });

  it('removes filter from state', () => {
    const filter1 = 'My filter 1';
    const filter2 = 'My filter 2';
    let newState = reducer(undefined, {
      type: ActionTypes.ADD_CHANGES_FILTER_ITEM,
      filter: filter1
    });
    newState = reducer(newState, {
      type: ActionTypes.ADD_CHANGES_FILTER_ITEM,
      filter: filter2
    });
    newState = reducer(newState, {
      type: ActionTypes.REMOVE_CHANGES_FILTER_ITEM,
      filter: filter1
    });

    expect(newState.filters.length).toBe(1);
    expect(newState.filters[0]).toBe(filter2);
  });

  it('number of items is capped by maxChangesListed', () => {

    // to keep the test speedy, we override the default max value
    const maxChanges = 10;
    const changes = [];
    for (let i = 0; i < maxChanges + 10; i++) {
      changes.push({ id: 'doc_' + i, seq: 1, changes: {}});
    }
    let state = reducer(undefined, {type: 'DO_NOTHING'});
    state.maxChangesListed = maxChanges;

    const seqNum = 123;
    state = reducer(state, {
      type: ActionTypes.UPDATE_CHANGES,
      seqNum,
      changes
    });
    expect(state.changes.length).toBe(changes.length);
    expect(state.filteredChanges.length).toBe(maxChanges);
  });

  it('tracks last sequence number', () => {
    let state = reducer(undefined, {type: 'DO_NOTHING'});
    expect(state.lastSequenceNum).toBeNull();

    const seqNum = 123;
    state = reducer(state, {
      type: ActionTypes.UPDATE_CHANGES,
      seqNum,
      changes: []
    });

    // confirm it's been stored
    expect(state.lastSequenceNum).toBe(seqNum);
  });

  it('"true" filter should apply to change deleted status', () => {
    let state = reducer(undefined, {
      type: ActionTypes.UPDATE_CHANGES,
      seqNum: 123,
      changes: changesList
    });

    // add a filter
    state = reducer(state, {
      type: ActionTypes.ADD_CHANGES_FILTER_ITEM,
      filter: 'true'
    });

    // confirm only the two deleted items are part of filtered results
    expect(state.filteredChanges.length).toBe(2);
    state.filteredChanges.forEach(el => {
      expect(el.deleted).toBe(true);
    });
  });

  // confirms that if there are multiple filters, ALL are applied to return the subset of results that match
  // all filters
  it('multiple filters should all be applied to results', () => {
    let state = reducer(undefined, {
      type: ActionTypes.UPDATE_CHANGES,
      seqNum: 123,
      changes: changesList
    });

    // add the filters
    state = reducer(state, {
      type: ActionTypes.ADD_CHANGES_FILTER_ITEM,
      filter: 'true'
    });
    state = reducer(state, {
      type: ActionTypes.ADD_CHANGES_FILTER_ITEM,
      filter: '1'
    });

    // confirm only doc_5 matches both filters
    expect(state.filteredChanges.length).toBe(1);
    expect(state.filteredChanges[0].id).toBe('doc_5');
  });

});
