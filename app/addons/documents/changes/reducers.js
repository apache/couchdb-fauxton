
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

import ActionTypes from './actiontypes';
import Helpers from '../helpers';

const initialState = {
  isLoaded: false,
  filters: [],
  changes: [],
  filteredChanges: [],
  maxChangesListed: 100,
  showingSubset: false,
  lastSequenceNum: null
};

function updateChanges(state, seqNum, changes) {
  const newState = {
    ...state,
    // make a note of the most recent sequence number. This is used for a point of reference for polling for new changes
    lastSequenceNum: seqNum,
    isLoaded: true
  };

  // mark any additional changes that come after first page load as "new" so we can add a nice highlight effect
  // when the new row is rendered
  const firstBatch = newState.changes.length === 0;
  newState.changes.forEach((change) => {
    change.isNew = false;
  });

  const newChanges = changes.map((change) => {
    const seq = Helpers.getSeqNum(change.seq);
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
  newState.changes = newChanges.concat(newState.changes);
  updateFilteredChanges(newState);
  return newState;
}

function addFilter(state, filter) {
  const newFilters = state.filters.slice();
  newFilters.push(filter);

  const newState = {
    ...state,
    filters: newFilters
  };
  updateFilteredChanges(newState);
  return newState;
}

function removeFilter(state, filter) {
  const newFilters = state.filters.slice();
  const idx = newFilters.indexOf(filter);
  if (idx >= 0) {
    newFilters.splice(idx, 1);
  }

  const newState = {
    ...state,
    filters: newFilters
  };
  updateFilteredChanges(newState);
  return newState;
}

function updateFilteredChanges(state) {
  state.showingSubset = false;
  let numMatches = 0;
  state.filteredChanges = state.changes.filter((change) => {
    if (numMatches >= state.maxChangesListed) {
      state.showingSubset = true;
      return false;
    }
    let changeStr = JSON.stringify(change);
    let match = state.filters.every((filter) => {
      return new RegExp(filter, 'i').test(changeStr);
    });

    if (match) {
      numMatches++;
    }
    return match;
  });
}

export default function changes (state = initialState, action) {
  switch (action.type) {

    case ActionTypes.UPDATE_CHANGES:
      // only bother updating the list of changes if the seq num has changed
      if (state.lastSequenceNum !== action.seqNum) {
        return updateChanges(state, action.seqNum, action.changes);
      }
      return state;

    case ActionTypes.ADD_CHANGES_FILTER_ITEM:
      return addFilter(state, action.filter);

    case ActionTypes.REMOVE_CHANGES_FILTER_ITEM:
      return removeFilter(state, action.filter);

    default:
      return state;
  }
}
