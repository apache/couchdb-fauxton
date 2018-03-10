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


import {
  COMPACTION_CLEANUP_FINISHED, COMPACTION_CLEANUP_STARTED, COMPACTION_COMPACTION_FINISHED,
  COMPACTION_COMPACTION_STARTING,
  COMPACTION_VIEW_FINISHED,
  COMPACTION_VIEW_STARTED
} from "./actiontypes";
import _ from 'lodash';

const cloneAssign = (state, toAssign = {}) => {
  let newState = _.cloneDeep(state);
  _.assign(newState, toAssign);
  return newState;
};

const initialState = {
  isCompacting: false,
  isCleaningView: false,
  isCompactingView: false
};

export default function compaction(state = initialState, action) {
  const {type} = action;
  switch (type) {
    case COMPACTION_COMPACTION_STARTING:
      return cloneAssign(state, {
        isCompacting: true
      });
    case COMPACTION_COMPACTION_FINISHED:
      return cloneAssign(state, {
        isCompacting: false
      });
    case COMPACTION_CLEANUP_STARTED:
      return cloneAssign(state, {
        isCleaningViews: true
      });
    case COMPACTION_CLEANUP_FINISHED:
      return cloneAssign(state, {
        isCleaningViews: false
      });
    case COMPACTION_VIEW_STARTED:
      return cloneAssign(state, {
        isCompactingView: true
      });
    case COMPACTION_VIEW_FINISHED:
      return cloneAssign(state, {
        isCompactingView: false
      });
    default:
      return state;
  }
}

export const isCompacting = state => state.isCompacting;
export const isCleaningViews = state => state.isCleaningViews;
export const isCompactingView = state => state.isCompactingView;
export const getDesignDoc = state => state.designDoc;
