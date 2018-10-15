
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
import utils from '../../../../test/mocha/testUtils';
import ActionTypes from '../changes/actiontypes';
import reducer from '../changes/reducers';

FauxtonAPI.router = new FauxtonAPI.Router([]);

const assert = utils.assert;

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

    assert.ok(newState.filters.length === 1);
    assert.ok(newState.filters[0] === filter);
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

    assert.ok(newState.filters.length === 1);
    assert.ok(newState.filters[0] === filter2);
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
    assert.equal(state.changes.length, changes.length);
    assert.equal(state.filteredChanges.length, maxChanges);
  });

  it('tracks last sequence number', () => {
    let state = reducer(undefined, {type: 'DO_NOTHING'});
    assert.equal(state.lastSequenceNum, null);

    const seqNum = 123;
    state = reducer(state, {
      type: ActionTypes.UPDATE_CHANGES,
      seqNum,
      changes: []
    });

    // confirm it's been stored
    assert.equal(state.lastSequenceNum, seqNum);
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
    assert.equal(state.filteredChanges.length, 2);
    state.filteredChanges.forEach(el => {
      assert.equal(el.deleted, true);
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
    assert.equal(state.filteredChanges.length, 1);
    assert.equal(state.filteredChanges[0].id, 'doc_5');
  });

});
